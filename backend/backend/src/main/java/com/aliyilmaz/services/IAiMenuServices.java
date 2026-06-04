package com.aliyilmaz.services;

import java.util.List;

import com.aliyilmaz.dto.DtoUrun;

public interface IAiMenuServices {

	DtoUrun urunAiAnaliz(Integer urunId);

	List<DtoUrun> restoranMenuAiAnaliz(Integer restoranId);
}
