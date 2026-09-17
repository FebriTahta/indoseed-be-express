master untuk menghubungkan varietas dengan parameter penilaian dinamis

"Setiap varietas punya banyak parameter, dan setiap parameter bisa punya nilai yang berbeda."

Saya tidak akan langsung membuat MASTER_PARAMETER_RULE.

Saya akan mulai dari 3 tabel inti + 1 tabel option:

MASTER_VARIETAS
       │
       ▼
VARIETAS_PARAMETER
       │
       ▼
MASTER_PARAMETER
       │
       ▼
MASTER_PARAMETER_OPTION

Dengan:

MASTER_PARAMETER
-------------------------
ID
KODE
NAMA
NAMA_MODUL
TIPE_NILAI
SATUAN
IS_ACTIVE
MASTER_PARAMETER_OPTION
-------------------------
ID
PARAMETER_ID
KODE
NAMA
URUTAN
IS_ACTIVE
VARIETAS_PARAMETER
-------------------------
ID
VARIETAS_ID
PARAMETER_ID
OPTION_ID
NILAI_NUMBER
NILAI_TEXT
OPERATOR
NILAI_MIN
NILAI_MAX

Ini sudah cukup fleksibel untuk kasus Anda.

Contoh fleksibilitasnya

Besok Anda ingin menambahkan:

pH Tanah

cukup insert:

KODE        : PH_TANAH
NAMA        : pH Tanah
TIPE_NILAI  : NUMBER
SATUAN       : pH

Tidak perlu ALTER TABLE.

Atau:

Kelembaban Tanah

dengan:

TIPE_NILAI : NUMBER
SATUAN     : %

Atau:

Bentuk Daun

dengan:

TIPE_NILAI : OPTION

dan option:

Bulat
Lonjong
Lancip