from django.apps import AppConfig


class PlcCommunicationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plc_communication'
    verbose_name = 'PLC Communication'

    def ready(self):
        """Initialize PLC connections when Django starts"""
        import logging
        logger = logging.getLogger(__name__)

        try:
            from .services.connection_manager import plc_manager
            # Auto-connect on startup (optional)
            # plc_manager.connect()
            logger.info("PLC Communication app initialized")
        except Exception as e:
            logger.error(f"Failed to initialize PLC communication: {e}")