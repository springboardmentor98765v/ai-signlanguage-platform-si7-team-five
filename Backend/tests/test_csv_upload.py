import os

def test_bulk_upload_lessons(client, tmp_path):
    # Create a sample CSV file
    csv_file = tmp_path / "lessons.csv"
    with open(csv_file, "w") as f:
        f.write("title,category,difficulty\n")
        f.write("Letter A,Alphabet,Easy\n")
        f.write("Word HELLO,Words,Medium\n")

    response = client.post(
        "/admin/lessons/bulk-upload",
        files={"file": ("lessons.csv", csv_file.read_bytes(), "text/csv")},
    )
    assert response.status_code == 200
    assert len(response.json()["lessons"]) >= 2
