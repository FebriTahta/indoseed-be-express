const axios = require('axios');
axios.put('http://localhost:5000/api/qc/penguji/28adbe1d-2c53-4a1f-bf27-ecd9474dfef8', {
  kodePenguji: "PENG-001",
  nama: "Penguji Utama",
  email: "as@gmail.com",
  laboratoriumId: "879db46b-e75c-4a3c-8c4c-5d67622bbee4",
  noTelepon: "",
  metodeUji: [],
  tanggalBergabung: "2026-08-27",
  status: "Aktif",
  berlakuHingga: "",
  keterangan: "",
  noSertifikat: "",
  tanggalSertifikat: "",
  foto: null,
  sertifikatFile: null
}).then(res => console.log(res.data)).catch(err => console.error(err.response?.data || err.message));
