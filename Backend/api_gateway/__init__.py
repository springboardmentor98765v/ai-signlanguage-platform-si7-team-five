# The former gateway router modules duplicated active service routes or exposed
# placeholder behaviour. They are deliberately not mounted. Canonical routes
# are registered directly in Backend/main.py.
routers = []

__all__ = ["routers"]
