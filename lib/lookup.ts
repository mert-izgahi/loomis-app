export interface OptionType {
    value: string;
    label: string;
}

export const sortOptions = [
    { value: "created-desc", label: "Oluşturma Tarihi (Yeni Olanlar)" },
    { value: "created-asc", label: "Oluşturma Tarihi (Eski Olanlar)" },
    { value: "name-asc", label: "Ad (A to Z)" },
    { value: "name-desc", label: "Ad (Z to A)" },
];

export const roleOptions = [
    { value: "all", label: "Tümü" },
    { value: "Admin", label: "Admin" },
    { value: "User", label: "Kullanıcı" },
];

export const activeOptions = [
    { value: "all", label: "Tümü" },
    { value: "true", label: "Aktif" },
    { value: "false", label: "Pasif" },
];

export const reportStatusOptions = [
    { value: "all", label: "Tümü" },
    { value: "Pending", label: "Beklemede" },
    { value: "Draft", label: "Taslak" },
    { value: "Published", label: "Yayınlandı" }
]

export const reportTypeOptions = [
    { value: "all", label: "Tümü" },
    { value: "Internal", label: "Internal" },
    { value: "External", label: "External" }
]

export const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
