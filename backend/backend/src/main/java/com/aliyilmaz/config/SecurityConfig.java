package com.aliyilmaz.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.aliyilmaz.security.CustomUserDetailsService;
import com.aliyilmaz.security.JwtAuthFilter;
import com.aliyilmaz.security.RestAuthenticationEntryPoint;

@Configuration
public class SecurityConfig {

	private final JwtAuthFilter jwtAuthFilter;
	private final CustomUserDetailsService userDetailsService;
	private final RestAuthenticationEntryPoint authenticationEntryPoint;
	private final CorsConfig corsConfig;

	public SecurityConfig(JwtAuthFilter jwtAuthFilter,
			CustomUserDetailsService userDetailsService,
			RestAuthenticationEntryPoint authenticationEntryPoint,
			CorsConfig corsConfig) {
		this.jwtAuthFilter = jwtAuthFilter;
		this.userDetailsService = userDetailsService;
		this.authenticationEntryPoint = authenticationEntryPoint;
		this.corsConfig = corsConfig;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider saglayici = new DaoAuthenticationProvider();
		saglayici.setUserDetailsService(userDetailsService);
		saglayici.setPasswordEncoder(passwordEncoder());
		return saglayici;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration konfig) throws Exception {
		return konfig.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				.cors(c -> c.configurationSource(corsConfig.corsConfigurationSource()))
				.csrf(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(e -> e.authenticationEntryPoint(authenticationEntryPoint))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(
								AntPathRequestMatcher.antMatcher("/pick-a-bite/auth/kayit"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/auth/giris"))
						.permitAll()
						.requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/pick-a-bite/restoranlar/**"))
						.permitAll()
						.requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/pick-a-bite/restoranlar"))
						.permitAll()
						.requestMatchers(
								AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/pick-a-bite/restoranlar/*/kategoriler"),
								AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/pick-a-bite/kategoriler/**"),
								AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/pick-a-bite/kategoriler/**"),
								AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/pick-a-bite/kategoriler/**"),
								AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/pick-a-bite/urunler/**"),
								AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/pick-a-bite/urunler/**"),
								AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/pick-a-bite/restoranlar/*"),
								AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/pick-a-bite/restoranlar/*"))
						.hasRole("RESTORAN")
						.requestMatchers(
								AntPathRequestMatcher.antMatcher("/pick-a-bite/chat"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/oneri"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/karsilastir"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/urunler/*/ai-analiz"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/restoranlar/*/menu/ai-analiz"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/admin/**"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/auth/ben"),
								AntPathRequestMatcher.antMatcher("/pick-a-bite/kullanici/**"))
						.authenticated()
						.anyRequest().authenticated())
				.authenticationProvider(authenticationProvider())
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
