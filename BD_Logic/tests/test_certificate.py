from certificates.certificate_engine import CertificatesEngine
def test_certificate():
    engine = CertificatesEngine()
    
    certificate = engine.generate_id()
    
    assert len(certificate) == 8