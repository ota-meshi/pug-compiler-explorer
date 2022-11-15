<script lang="ts">
	/* global __DEPS_PKGS__ -- define by vite */
	import github from '$lib/images/github.svg';

	let packages: Record<string, { homepage: string; name: string; version: string }> = {};
	// @ts-expect-error -- define by vite
	if (typeof __DEPS_PKGS__ !== 'undefined') {
		// @ts-expect-error -- define by vite
		packages = (__DEPS_PKGS__ || {}) as unknown;
	}
</script>

<header>
	<div class="title">
		<p class="title-content">
			<img
				class="logo"
				src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg"
				alt="Pug"
			/>
			<a href="https://pugjs.org/api/reference.html#pugcompilesource-options"> Pug compiler </a>
			Explorer
		</p>
	</div>
	<div class="packages-info">
		{#each Object.keys(packages) as nm}
			{@const pkg = packages[nm]}
			<a class="package-item" href={pkg.homepage} target="_blank" rel="noopener noreferrer"
				>{pkg.name}@{pkg.version}</a
			>
		{/each}
	</div>

	<div class="corner">
		<a href="https://github.com/ota-meshi/pug-compiler-explorer">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
	}

	.title {
		display: flex;
		height: 3em;
		align-items: center;
		padding: 0 0.5rem;
		letter-spacing: 0.1em;
		text-decoration: none;
	}
	.title a,
	.title p {
		color: #2c3e50;
		font-weight: 700;
		font-size: 1rem;
		text-decoration: auto;
	}
	.title-content {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.logo {
		height: 20px;
	}
	.packages-info {
		padding-left: 16px;
		margin-left: auto;
		display: flex;
		flex-wrap: wrap;
		font-size: 70%;
		justify-content: flex-end;
	}

	.packages-info .package-item {
		padding: 0 8px;
		display: flex;
		align-items: center;
	}
	.packages-info a {
		color: #2c3e50;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	a:hover {
		color: var(--color-theme-1);
		transition: color 0.2s linear;
	}
</style>
