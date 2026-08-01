def test_admin_bulk_operations(client, tmp_path):
    # Bulk activate users
    response = client.put("/admin/users/bulk-status", params={"user_ids": [1, 2], "active": True})
    assert response.status_code == 200
    assert all(u["active"] for u in response.json()["users"])

    # Bulk upload lessons via CSV
    csv_file = tmp_path / "lessons.csv"
    with open(csv_file, "w") as f:
        f.write("title,category,difficulty\n")
        f.write("Letter B,Alphabet,Easy\n")
        f.write("Word THANKS,Words,Medium\n")

    response = client.post("/admin/lessons/bulk-upload", params={"file_path": str(csv_file)})
    assert response.status_code == 200
    assert len(response.json()["lessons"]) >= 2
