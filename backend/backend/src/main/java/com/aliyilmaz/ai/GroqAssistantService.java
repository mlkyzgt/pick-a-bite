package com.aliyilmaz.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.aliyilmaz.exception.ServiceUnavailableException;

@Service
public class GroqAssistantService {

	private final ChatClient chatClient;
	private final AiConfig.GroqAvailability availability;
	private final StructuredQueryParser parser;

	public GroqAssistantService(ChatClient chatClient,
			AiConfig.GroqAvailability availability,
			StructuredQueryParser parser) {
		this.chatClient = chatClient;
		this.availability = availability;
		this.parser = parser;
	}

	public void ensureAvailable() {
		if (!availability.available()) {
			throw new ServiceUnavailableException(
					"Yapay zekâ servisi şu an kullanılamıyor. GROQ_API_KEY ortam değişkenini ayarlayın "
							+ "(https://console.groq.com/keys).");
		}
	}

	public StructuredQueryParser.UrunAnalizSonuc urunAnalizEt(String urunAdi, String aciklama) {
		ensureAvailable();
		String user = "Ürün: " + urunAdi + "\nAçıklama: " + (aciklama == null ? "-" : aciklama);
		String response = chatClient.prompt()
				.system(AiPromptTemplates.URUN_ANALIZ_SYSTEM)
				.user(user)
				.call()
				.content();
		return parser.parseUrunAnaliz(response);
	}

	public StructuredQueryParser.ParsedQuery sorguAyristir(String mesaj) {
		ensureAvailable();
		String response = chatClient.prompt()
				.system(AiPromptTemplates.SORGU_AYRISTIRMA_SYSTEM)
				.user(mesaj)
				.call()
				.content();
		return parser.parse(response);
	}

	public String chatYanitiUret(String sistemEk, String kullaniciMesaji, String menuBaglami) {
		ensureAvailable();
		String system = AiPromptTemplates.CHATBOT_SYSTEM + "\n" + sistemEk + "\n\nMenü:\n" + menuBaglami;
		return chatClient.prompt()
				.system(system)
				.user(kullaniciMesaji)
				.call()
				.content();
	}

	public String kisaOneriAciklamasi(String kullaniciOzeti, String urunListesi) {
		ensureAvailable();
		return chatClient.prompt()
				.system("Türkçe, en fazla 2 cümle. Tıbbi tavsiye verme.")
				.user("Kullanıcı: " + kullaniciOzeti + "\nÖnerilen ürünler:\n" + urunListesi)
				.call()
				.content();
	}
}
