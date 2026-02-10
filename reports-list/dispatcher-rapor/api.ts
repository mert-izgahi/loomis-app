// reports-list/dispatcher-rapor/api.ts

import { configs } from "@/configs";
import { Context, Hono } from "hono";
import sql from "mssql";
import { authMiddleware } from "@/lib/auth";
import { Role } from "@/lib/enums";

const dispatcherApi = new Hono();

const DEFAULT_DISPATCHER_USERNAME = "aziz.kaya";

const SEROTONIN_SUBE_WHERE = `
      WHERE SubeAdi IN (
        SELECT SerotoninSube
        FROM [DWH].[SubeEslestirme]
        WHERE KullaniciAdi = @username
          AND SerotoninSube IS NOT NULL
      )`;

const PUANTAJ_SUBE_WHERE = `
      WHERE PuantajSorumlulukMerkezi IN (
        SELECT PuantajSube
        FROM [DWH].[SubeEslestirme]
        WHERE KullaniciAdi = @username
          AND PuantajSube IS NOT NULL
      )`;

const getDispatcherUsername = (c: Context) => {
  const user = c.get("user") as { email?: string } | undefined;
  const email = typeof user?.email === "string" ? user.email : "";
  const username = email.includes("@") ? email.split("@")[0] : email;
  const normalizedUsername = username.toLowerCase();

  if (!normalizedUsername) {
    return DEFAULT_DISPATCHER_USERNAME;
  }

  if (normalizedUsername === "kokpituser") {
    return DEFAULT_DISPATCHER_USERNAME;
  }

  return normalizedUsername;
};

const isAdminUser = (c: Context) => {
  const user = c.get("user") as { role?: string } | undefined;
  return user?.role === Role.Admin;
};

const SERVER_NAME = "TRLOOSQL-SRV\\TRLOOSQLSRV";
const DATABASE_NAME = "Mdm_Reporting";

const config: sql.config = {
  user: configs.MSSQL_USER as string,
  password: configs.MSSQL_PASSWORD as string,
  server: SERVER_NAME,
  database: DATABASE_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

async function getSqlConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("✅ Database connected successfully");
    }
    return pool;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return null;
  }
}

dispatcherApi.use("*", authMiddleware);

dispatcherApi.get("/sube-eslestirme", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      const mockData = [
        { SerotoninSube: "ADANA", PuantajSube: "ADANA", KullaniciAdi: "aziz.kaya" },
        { SerotoninSube: "ISKENDERUN", PuantajSube: "ISKENDERUN", KullaniciAdi: "aziz.kaya" },
        { SerotoninSube: "MERSIN", PuantajSube: "MERSIN", KullaniciAdi: "aziz.kaya" },
      ];
      return c.json(mockData);
    }

    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
        SELECT
          SerotoninSube,
          HumanistSube,
          VITSube,
          HaritaSubeAdi,
          PuantajSube,
          KullaniciAdi
        FROM [DWH].[SubeEslestirme]
        WHERE KullaniciAdi = @username
      `);

    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting sube-eslestirme data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/hizmet-turu", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { HizmetTuru: "Nakit Yönetimi", AcikKapaliFlag: "Açık", IsemriSayisi: 245, Oran: 0.35 },
        { HizmetTuru: "Nakit Yönetimi", AcikKapaliFlag: "Kapalı", IsemriSayisi: 420, Oran: 0.60 },
        { HizmetTuru: "Nakit Yönetimi", AcikKapaliFlag: "Bilinmiyor", IsemriSayisi: 35, Oran: 0.05 },
        { HizmetTuru: "ATM Hizmetleri", AcikKapaliFlag: "Açık", IsemriSayisi: 180, Oran: 0.30 },
        { HizmetTuru: "ATM Hizmetleri", AcikKapaliFlag: "Kapalı", IsemriSayisi: 390, Oran: 0.65 },
        { HizmetTuru: "ATM Hizmetleri", AcikKapaliFlag: "Bilinmiyor", IsemriSayisi: 30, Oran: 0.05 },
        { HizmetTuru: "Değerli Eşya", AcikKapaliFlag: "Açık", IsemriSayisi: 75, Oran: 0.25 },
        { HizmetTuru: "Değerli Eşya", AcikKapaliFlag: "Kapalı", IsemriSayisi: 210, Oran: 0.70 },
        { HizmetTuru: "Değerli Eşya", AcikKapaliFlag: "Bilinmiyor", IsemriSayisi: 15, Oran: 0.05 },
      ];
      return c.json(mockData);
    }
    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT
          HizmetTuru,
          AcikKapaliFlag,
          COUNT(DISTINCT IsEmriId) AS IsemriSayisi,
          1.0 * COUNT(DISTINCT IsEmriId) / SUM(COUNT(DISTINCT IsEmriId)) OVER (
              PARTITION BY HizmetTuru
          ) AS Oran
      FROM [DWH].[SerotoninIsemriDispatcher_Ozet]
      ${isAdmin ? "" : SEROTONIN_SUBE_WHERE}
      GROUP BY
          HizmetTuru,
          AcikKapaliFlag
      ORDER BY HizmetTuru, AcikKapaliFlag
    `);
    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting HizmetTuru data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/kayit-durumu", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { KayitDurum: "Tamamlandı", AcikKapaliFlag: "Kapalı", IsemriSayısı: 850 },
        { KayitDurum: "Tamamlandı", AcikKapaliFlag: "Açık", IsemriSayısı: 120 },
        { KayitDurum: "Beklemede", AcikKapaliFlag: "Açık", IsemriSayısı: 280 },
        { KayitDurum: "Beklemede", AcikKapaliFlag: "Kapalı", IsemriSayısı: 45 },
        { KayitDurum: "İptal", AcikKapaliFlag: "Kapalı", IsemriSayısı: 65 },
        { KayitDurum: "İptal", AcikKapaliFlag: "Bilinmiyor", IsemriSayısı: 25 },
        { KayitDurum: "Devam Ediyor", AcikKapaliFlag: "Açık", IsemriSayısı: 190 },
        { KayitDurum: "Devam Ediyor", AcikKapaliFlag: "Bilinmiyor", IsemriSayısı: 30 },
      ];
      return c.json(mockData);
    }
    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT
          KayitDurum,
          AcikKapaliFlag,
          COUNT(DISTINCT IsEmriId) AS IsemriSayısı
      FROM [DWH].[SerotoninIsemriDispatcher_Ozet]
      ${isAdmin ? "" : SEROTONIN_SUBE_WHERE}
      GROUP BY
          KayitDurum,
          HizmetTuru,
          AcikKapaliFlag
      ORDER BY KayitDurum, AcikKapaliFlag
    `);
    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting KayitDurumu data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/arac-durumu", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { AracDurumu: "Araca Atanmış", IsemriSayisi: 1250, Oran: 0.78 },
        { AracDurumu: "Araca Atanmamış", IsemriSayisi: 350, Oran: 0.22 },
      ];
      return c.json(mockData);
    }

    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT
          CASE
              WHEN Arac IS NULL THEN 'Araca Atanmamış'
              ELSE 'Araca Atanmış'
          END AS AracDurumu,
          COUNT(DISTINCT IsEmriId) AS IsemriSayisi,
          1.0 * COUNT(DISTINCT IsEmriId) / SUM(COUNT(DISTINCT IsEmriId)) OVER () AS Oran
      FROM [DWH].[SerotoninIsemriDispatcher_Ozet]
      ${isAdmin ? "" : SEROTONIN_SUBE_WHERE}
      GROUP BY
          CASE
              WHEN Arac IS NULL THEN 'Araca Atanmamış'
          ELSE 'Araca Atanmış'
          END
      ORDER BY AracDurumu;
    `);

    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting AracDurumu data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/puantaj-personel", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { PuantajSorumlulukMerkezi: "İstanbul Avrupa", PersonelSayisi: 85 },
        { PuantajSorumlulukMerkezi: "İstanbul Anadolu", PersonelSayisi: 72 },
        { PuantajSorumlulukMerkezi: "Ankara", PersonelSayisi: 45 },
        { PuantajSorumlulukMerkezi: "İzmir", PersonelSayisi: 38 },
        { PuantajSorumlulukMerkezi: "Bursa", PersonelSayisi: 28 },
        { PuantajSorumlulukMerkezi: "Antalya", PersonelSayisi: 22 },
        { PuantajSorumlulukMerkezi: "Adana", PersonelSayisi: 18 },
        { PuantajSorumlulukMerkezi: "Konya", PersonelSayisi: 15 },
      ];
      return c.json(mockData);
    }

    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT 
        PuantajSorumlulukMerkezi,
        PersonelSayisi
      FROM MDM_Reporting.DWH.SerotoninIsemriDispatcher_PuantajOzet
      ${isAdmin ? "" : PUANTAJ_SUBE_WHERE}
      ORDER BY PersonelSayisi DESC;
    `);

    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting PuantajPersonel data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/hizmet-operasyon", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { HizmetTuru: "Nakit Yönetimi", OperasyonTuru: "Toplama", ToplamIsemriSayisi: 320, AcikIsemriSayisi: 96, KapaliIsemriSayisi: 208, BilinmeyenIsemriSayisi: 16, AcikOran: 30.00, KapaliOran: 65.00, BilinmeyenOran: 5.00 },
        { HizmetTuru: "Nakit Yönetimi", OperasyonTuru: "Dağıtım", ToplamIsemriSayisi: 280, AcikIsemriSayisi: 70, KapaliIsemriSayisi: 196, BilinmeyenIsemriSayisi: 14, AcikOran: 25.00, KapaliOran: 70.00, BilinmeyenOran: 5.00 },
        { HizmetTuru: "ATM Hizmetleri", OperasyonTuru: "Para Yükleme", ToplamIsemriSayisi: 450, AcikIsemriSayisi: 135, KapaliIsemriSayisi: 293, BilinmeyenIsemriSayisi: 22, AcikOran: 30.00, KapaliOran: 65.11, BilinmeyenOran: 4.89 },
        { HizmetTuru: "ATM Hizmetleri", OperasyonTuru: "Bakım", ToplamIsemriSayisi: 150, AcikIsemriSayisi: 45, KapaliIsemriSayisi: 97, BilinmeyenIsemriSayisi: 8, AcikOran: 30.00, KapaliOran: 64.67, BilinmeyenOran: 5.33 },
        { HizmetTuru: "Değerli Eşya", OperasyonTuru: "Transfer", ToplamIsemriSayisi: 180, AcikIsemriSayisi: 45, KapaliIsemriSayisi: 126, BilinmeyenIsemriSayisi: 9, AcikOran: 25.00, KapaliOran: 70.00, BilinmeyenOran: 5.00 },
        { HizmetTuru: "Değerli Eşya", OperasyonTuru: "Saklama", ToplamIsemriSayisi: 120, AcikIsemriSayisi: 30, KapaliIsemriSayisi: 84, BilinmeyenIsemriSayisi: 6, AcikOran: 25.00, KapaliOran: 70.00, BilinmeyenOran: 5.00 },
      ];
      return c.json(mockData);
    }

    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT
        HizmetTuru,
        OperasyonTuru,
        COUNT(DISTINCT IsEmriId) AS ToplamIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Açık' THEN IsEmriId END) AS AcikIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Kapalı' THEN IsEmriId END) AS KapaliIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Bilinmiyor' THEN IsEmriId END) AS BilinmeyenIsemriSayisi,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Açık' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS AcikOran,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Kapalı' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS KapaliOran,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Bilinmiyor' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS BilinmeyenOran
      FROM DWH.SerotoninIsemriDispatcher_Ozet
      ${isAdmin ? "" : SEROTONIN_SUBE_WHERE}
      GROUP BY HizmetTuru, OperasyonTuru
      ORDER BY HizmetTuru, OperasyonTuru;
    `);

    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting hizmet-operasyon data:", err);
    return c.json({ error: err.message }, 500);
  }
});

dispatcherApi.get("/sube-arac", async (c) => {
  try {
    const pool = await getSqlConnection();
    if (!pool) {
      // Mock data döndür - veritabanı bağlantısı yoksa
      const mockData = [
        { SubeAdi: "İstanbul Avrupa", Arac: "34 ABC 123", ToplamIsemriSayisi: 150, AcikIsemriSayisi: 45, KapaliIsemriSayisi: 100, BilinmeyenIsemriSayisi: 5, AcikOran: 30.00, KapaliOran: 66.67, BilinmeyenOran: 3.33 },
        { SubeAdi: "İstanbul Avrupa", Arac: "34 DEF 456", ToplamIsemriSayisi: 120, AcikIsemriSayisi: 30, KapaliIsemriSayisi: 85, BilinmeyenIsemriSayisi: 5, AcikOran: 25.00, KapaliOran: 70.83, BilinmeyenOran: 4.17 },
        { SubeAdi: "İstanbul Anadolu", Arac: "34 GHI 789", ToplamIsemriSayisi: 200, AcikIsemriSayisi: 60, KapaliIsemriSayisi: 130, BilinmeyenIsemriSayisi: 10, AcikOran: 30.00, KapaliOran: 65.00, BilinmeyenOran: 5.00 },
        { SubeAdi: "İstanbul Anadolu", Arac: "34 JKL 012", ToplamIsemriSayisi: 180, AcikIsemriSayisi: 40, KapaliIsemriSayisi: 135, BilinmeyenIsemriSayisi: 5, AcikOran: 22.22, KapaliOran: 75.00, BilinmeyenOran: 2.78 },
        { SubeAdi: "Ankara", Arac: "06 MNO 345", ToplamIsemriSayisi: 90, AcikIsemriSayisi: 20, KapaliIsemriSayisi: 65, BilinmeyenIsemriSayisi: 5, AcikOran: 22.22, KapaliOran: 72.22, BilinmeyenOran: 5.56 },
        { SubeAdi: "Ankara", Arac: "06 PRS 678", ToplamIsemriSayisi: 110, AcikIsemriSayisi: 35, KapaliIsemriSayisi: 70, BilinmeyenIsemriSayisi: 5, AcikOran: 31.82, KapaliOran: 63.64, BilinmeyenOran: 4.55 },
        { SubeAdi: "İzmir", Arac: "35 TUV 901", ToplamIsemriSayisi: 75, AcikIsemriSayisi: 15, KapaliIsemriSayisi: 55, BilinmeyenIsemriSayisi: 5, AcikOran: 20.00, KapaliOran: 73.33, BilinmeyenOran: 6.67 },
        { SubeAdi: "Bursa", Arac: "16 WXY 234", ToplamIsemriSayisi: 60, AcikIsemriSayisi: 10, KapaliIsemriSayisi: 48, BilinmeyenIsemriSayisi: 2, AcikOran: 16.67, KapaliOran: 80.00, BilinmeyenOran: 3.33 },
      ];
      const isAdmin = isAdminUser(c);
      const username = getDispatcherUsername(c);
      const allowedSubes = username === "aziz.kaya"
        ? ["Adana", "İskenderun", "Mersin"]
        : [];
      const filteredMock = !isAdmin && allowedSubes.length
        ? mockData.filter((row) => allowedSubes.includes(row.SubeAdi))
        : mockData;
      return c.json(filteredMock);
    }

    const username = getDispatcherUsername(c);
    const isAdmin = isAdminUser(c);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
      SELECT
        SubeAdi,
        Arac,
        COUNT(DISTINCT IsEmriId) AS ToplamIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Açık' THEN IsEmriId END) AS AcikIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Kapalı' THEN IsEmriId END) AS KapaliIsemriSayisi,
        COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Bilinmiyor' THEN IsEmriId END) AS BilinmeyenIsemriSayisi,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Açık' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS AcikOran,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Kapalı' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS KapaliOran,
        CAST(100.0 * COUNT(DISTINCT CASE WHEN AcikKapaliFlag = 'Bilinmiyor' THEN IsEmriId END) / NULLIF(COUNT(DISTINCT IsEmriId), 0) AS DECIMAL(5,2)) AS BilinmeyenOran
      FROM DWH.SerotoninIsemriDispatcher_Ozet
      ${isAdmin ? "" : SEROTONIN_SUBE_WHERE}
      GROUP BY SubeAdi, Arac
      ORDER BY SubeAdi, Arac;
    `);

    return c.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error getting sube-arac data:", err);
    return c.json({ error: err.message }, 500);
  }
});
export { dispatcherApi };
