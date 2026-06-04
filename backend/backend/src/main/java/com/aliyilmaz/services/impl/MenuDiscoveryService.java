package com.aliyilmaz.services.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.entities.Restoran;
import com.aliyilmaz.repository.AppRepository;
import com.aliyilmaz.services.IAppServices;
import com.aliyilmaz.services.IMenuServices;

@Service
public class MenuDiscoveryService {

	private static final double DEFAULT_YARICAP_KM = 50.0;

	private final IAppServices appServices;
	private final IMenuServices menuServices;
	private final AppRepository appRepository;

	public MenuDiscoveryService(IAppServices appServices, IMenuServices menuServices, AppRepository appRepository) {
		this.appServices = appServices;
		this.menuServices = menuServices;
		this.appRepository = appRepository;
	}

	@Transactional(readOnly = true)
	public List<DtoMenu> menuleriYukle(Integer restoranId, Double enlem, Double boylam, Double yaricapKm) {
		List<DtoMenu> menuler = new ArrayList<>();
		if (restoranId != null) {
			menuler.add(menuServices.menuGetir(restoranId));
			return menuler;
		}
		if (enlem != null && boylam != null) {
			double yaricap = yaricapKm == null ? DEFAULT_YARICAP_KM : yaricapKm;
			List<DtoRestoran> yakin = appServices.yakindakiRestoranlar(enlem, boylam, yaricap);
			if (yakin.isEmpty()) {
				yakin = appServices.getAllRestaurant();
			}
			for (DtoRestoran r : yakin) {
				menuler.add(menuServices.menuGetir(r.getId()));
			}
			return menuler;
		}
		for (Restoran r : appRepository.findAll()) {
			menuler.add(menuServices.menuGetir(r.getId()));
		}
		return menuler;
	}
}
