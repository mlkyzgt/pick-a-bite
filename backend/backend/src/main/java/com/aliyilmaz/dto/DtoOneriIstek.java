package com.aliyilmaz.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DtoOneriIstek {

	private Integer restoranId;

	private Double enlem;

	private Double boylam;

	private Double yaricapKm;

	private BigDecimal butceMax;
}
