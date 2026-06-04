package com.aliyilmaz.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoKarsilastirmaIstek {

	@Size(max = 2000)
	private String mesaj;

	private Double enlem;

	private Double boylam;

	private Double yaricapKm;

	private BigDecimal butceMax;
}
