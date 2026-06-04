package com.aliyilmaz.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class DtoChatYanit {

	private String yanitMetni;

	private List<DtoOnerilenUrun> onerilenUrunler = new ArrayList<>();

	private String uyariMesaji;

	private String kriterDegistirmeOnerisi;

	private String bilgilendirmeNotu = com.aliyilmaz.ai.AiPromptTemplates.BILGILENDIRME_NOTU;
}
