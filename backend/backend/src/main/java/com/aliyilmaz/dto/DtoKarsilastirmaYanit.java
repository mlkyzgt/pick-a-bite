package com.aliyilmaz.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class DtoKarsilastirmaYanit {

	private List<DtoKarsilastirmaOge> sonuclar = new ArrayList<>();

	private String mesaj;

	private String bilgilendirmeNotu = com.aliyilmaz.ai.AiPromptTemplates.BILGILENDIRME_NOTU;
}
