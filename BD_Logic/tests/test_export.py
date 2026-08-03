from exports.export_engine import ExportEngine

def test_json_export():
    engine = ExportEngine()
    result = engine.export_json(
        "sample.json",
        {
            "hello": "world"
        }
    )

    assert result == "sample.json"