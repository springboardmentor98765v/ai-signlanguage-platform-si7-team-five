import uuid

class CertificateEngine:
    def generate_id(self):
        return str(uuid.uuid4())[:8]
    