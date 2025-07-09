import { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";

interface Ruangan {
  nama: string;
  tempatTidur: number;
}

const dataRuangan: Ruangan[] = [
  { nama: "ICU", tempatTidur: 6 },
  { nama: "Gladiol", tempatTidur: 10 },
  { nama: "IGD", tempatTidur: 8 },
  { nama: "Tulip", tempatTidur: 12 },
  { nama: "Kenari", tempatTidur: 7 },
  { nama: "Wijaya Kusuma", tempatTidur: 9 },
  { nama: "Amarilis", tempatTidur: 5 },
  { nama: "IBS", tempatTidur: 4 },
];

export default function Ruangan() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRuangan, setSelectedRuangan] = useState<string>("");

  const handleLihatLinen = (ruangan: string) => {
    setSelectedRuangan(ruangan);
    setShowModal(true);
  };

  return (
    <div>
      <h3 className="mb-4">Daftar Ruangan</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Ruangan</th>
            <th>Jumlah Tempat Tidur</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dataRuangan.map((r, index) => (
            <tr key={r.nama}>
              <td>{index + 1}</td>
              <td>{r.nama}</td>
              <td>{r.tempatTidur}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLihatLinen(r.nama)}
                >
                  Lihat Linen
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Linen di Ruangan {selectedRuangan}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>📦 Placeholder: Daftar linen yang diterima di ruangan ini.</p>
          <ul>
            <li>Seprei - 10 pcs</li>
            <li>Handuk - 5 pcs</li>
            <li>Selimut - 3 pcs</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
