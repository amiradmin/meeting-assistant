from django.urls import path
from . import views

app_name = 'plc_communication'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),

    # Connection management
    path('api/status/', views.get_all_status, name='api_status'),
    path('api/connect/', views.connect_plc, name='api_connect'),
    path('api/disconnect/', views.disconnect_plc, name='api_disconnect'),

    # Data operations
    path('api/read/', views.read_tags, name='api_read'),
    path('api/write/', views.write_tag, name='api_write'),

    # Advanced features
    path('api/plc-info/', views.get_plc_info, name='api_plc_info'),
    path('api/browse-opcua/', views.browse_opcua_nodes, name='api_browse_opcua'),
]