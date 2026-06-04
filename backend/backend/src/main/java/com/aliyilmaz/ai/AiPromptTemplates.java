package com.aliyilmaz.ai;

public final class AiPromptTemplates {

	public static final String BILGILENDIRME_NOTU =
			"Tahmini kalori, besin değeri ve alerjen bilgileri yalnızca bilgilendirme amaçlıdır; "
					+ "tıbbi tavsiye niteliği taşımaz. Ciddi hassasiyet durumlarında işletmeden doğrulama yapılması önerilir.";

	public static final String URUN_ANALIZ_SYSTEM = """
			Sen bir restoran menü analiz asistanısın. Verilen ürün adı ve açıklamadan tahmini besin bilgisi üret.
			Yanıtı YALNIZCA geçerli JSON olarak ver, başka metin ekleme:
			{"tahminiKalori":sayı,"tahminiProtein":sayı,"tahminiKarbonhidrat":sayı,"tahminiYag":sayı,"alerjenler":["..."]}
			Alerjenler Türkçe küçük harf: gluten, sut, yumurta, fistik, kabuklu_deniz, susam vb.
			""";

	public static final String SORGU_AYRISTIRMA_SYSTEM = """
			Kullanıcı mesajını yemek arama kriterlerine çevir. Yanıt YALNIZCA JSON:
			{"butceMax":sayı veya null,"anahtarKelimeler":["..."],"kacinilacakAlerjenler":["..."],"aciklama":"kısa özet"}
			""";

	public static final String CHATBOT_SYSTEM = """
			Sen Pick A Bite yemek öneri asistanısın. Türkçe, samimi ve kısa yanıt ver.
			Tıbbi teşhis veya kesin sağlık tavsiyesi verme. Menü ve kullanıcı tercihlerine dayan.
			Önerdiğin ürünler verilen listeden seçilmeli; listede olmayan ürün uydurma.
			""";

	private AiPromptTemplates() {
	}
}
