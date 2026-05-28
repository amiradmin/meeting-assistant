import json
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

from .services.connection_manager import plc_manager
from .services.base import ConnectionStatus

logger = logging.getLogger(__name__)


def dashboard(request):
    """Main PLC control dashboard"""
    tag_mappings = getattr(settings, 'PLC_TAG_MAPPINGS', {})

    # Group tags by type for display
    grouped_tags = {
        's7_bus': [],
        'cp_opcua_server': [],
        'external_opcua': []
    }

    for tag_name, config in tag_mappings.items():
        conn_type = config.get('type', 's7_bus')
        if conn_type in grouped_tags:
            grouped_tags[conn_type].append({
                'name': tag_name,
                'address': config.get('address')
            })

    return render(request, 'plc_communication/dashboard.html', {
        'connections': plc_manager.get_all_status(),
        'grouped_tags': grouped_tags,
        'poll_interval': getattr(settings, 'PLC_POLL_INTERVAL', 2000),
    })


@require_http_methods(["GET"])
def get_all_status(request):
    """Get status of all PLC connections"""
    return JsonResponse({
        'success': True,
        'connections': plc_manager.get_all_status(),
        'active': plc_manager._active_connection
    })


@require_http_methods(["POST"])
def connect_plc(request):
    """Connect to PLC (all or specific)"""
    data = json.loads(request.body)
    connection_id = data.get('connection_id')

    if connection_id:
        success = plc_manager.connect(connection_id)
        message = f"Connected to {connection_id}" if success else f"Failed to connect to {connection_id}"
    else:
        success = plc_manager.connect()
        message = "Connected to PLC(s)" if success else "Failed to connect to any PLC"

    return JsonResponse({
        'success': success,
        'message': message,
        'connections': plc_manager.get_all_status()
    })


@require_http_methods(["POST"])
def disconnect_plc(request):
    """Disconnect from PLC"""
    data = json.loads(request.body)
    connection_id = data.get('connection_id')

    plc_manager.disconnect(connection_id)

    return JsonResponse({
        'success': True,
        'message': "Disconnected successfully",
        'connections': plc_manager.get_all_status()
    })


@require_http_methods(["GET"])
def read_tags(request):
    """Read multiple tags from PLC"""
    tags = request.GET.get('tags', '')
    tag_list = tags.split(',') if tags else []

    if not tag_list:
        # Read all configured tags
        tag_mappings = getattr(settings, 'PLC_TAG_MAPPINGS', {})
        tag_list = list(tag_mappings.keys())

    results = {}
    tag_mappings = getattr(settings, 'PLC_TAG_MAPPINGS', {})

    for tag_name in tag_list:
        if tag_name in tag_mappings:
            config = tag_mappings[tag_name]
            address = config.get('address')
            conn_type = config.get('type')

            value = plc_manager.read_value(address, connection_id=conn_type)
            results[tag_name] = value

    return JsonResponse({
        'success': True,
        'data': results,
        'timestamp': __import__('datetime').datetime.now().isoformat()
    })


@csrf_exempt
@require_http_methods(["POST"])
def write_tag(request):
    """Write value to PLC tag"""
    try:
        data = json.loads(request.body)
        tag_name = data.get('tag')
        value = data.get('value')

        if not tag_name or value is None:
            return JsonResponse({
                'success': False,
                'error': 'Missing tag or value'
            }, status=400)

        tag_mappings = getattr(settings, 'PLC_TAG_MAPPINGS', {})

        if tag_name not in tag_mappings:
            return JsonResponse({
                'success': False,
                'error': f'Unknown tag: {tag_name}'
            }, status=400)

        config = tag_mappings[tag_name]
        address = config.get('address')
        conn_type = config.get('type')

        success = plc_manager.write_value(address, value, connection_id=conn_type)

        return JsonResponse({
            'success': success,
            'message': f"Written {tag_name} = {value}" if success else "Write failed"
        })

    except Exception as e:
        logger.error(f"Write error: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_plc_info(request):
    """Get detailed PLC information (S7 specific)"""
    s7_conn = plc_manager.get_connection('s7_bus')

    if s7_conn and s7_conn.status == ConnectionStatus.CONNECTED:
        info = s7_conn.get_cpu_info()
        if info:
            return JsonResponse({'success': True, 'info': info})

    return JsonResponse({
        'success': False,
        'error': 'S7 connection not available'
    }, status=500)


@require_http_methods(["GET"])
def browse_opcua_nodes(request):
    """Browse OPC UA server nodes for discovery"""
    connection_id = request.GET.get('connection_id', 'cp_opcua_server')
    parent_node = request.GET.get('node', 'Root')

    conn = plc_manager.get_connection(connection_id)

    if not conn or conn.status != ConnectionStatus.CONNECTED:
        return JsonResponse({
            'success': False,
            'error': f'Connection {connection_id} not available'
        }, status=500)

    if hasattr(conn, 'browse_nodes'):
        nodes = conn.browse_nodes(parent_node)
        return JsonResponse({
            'success': True,
            'nodes': nodes
        })

    return JsonResponse({
        'success': False,
        'error': 'Browse not supported for this connection type'
    }, status=400)