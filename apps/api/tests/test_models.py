import uuid
from app.db.models import Disease, User
from app.scans.schemas import ScanResponse, PredictionItem, AdvisoryDetail, AdvisoryManagement, AdvisorySource


def test_scan_response_contract_schema():
    scan_id = uuid.uuid4()
    resp = ScanResponse(
        scanId=scan_id,
        status="done",
        modelVersion="v1.3.0",
        leafDetected=True,
        confidenceLevel="high",
        predictions=[
            PredictionItem(
                disease="tomato_late_blight",
                label="Late Blight",
                crop="Tomato",
                confidence=0.93,
            )
        ],
        heatmapUrl="https://s3.example.com/scans/heatmap.png",
        advisory=AdvisoryDetail(
            symptoms=["Dark spots on foliage"],
            management=AdvisoryManagement(
                organic=["Neem extract spray"],
                chemical=["Mancozeb 75 WP"],
            ),
            prevention=["Spacing"],
            sources=[AdvisorySource(name="ICAR", url="https://icar.org.in")],
        ),
        disclaimer="AI-assisted guidance only.",
    )
    dumped = resp.model_dump()
    assert dumped["scanId"] == scan_id
    assert dumped["confidenceLevel"] == "high"
    assert len(dumped["predictions"]) == 1
    assert dumped["predictions"][0]["disease"] == "tomato_late_blight"
    assert "ICAR" in dumped["advisory"]["sources"][0]["name"]
