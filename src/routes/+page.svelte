<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PugPlayground from '$lib/components/PugPlayground.svelte';
</script>

<svelte:head>
	<title>Pug compiler Explorer</title>
	<meta name="description" content="A web tool to explore the results generated by pug compiler." />
</svelte:head>

<Header />
<PugPlayground />
<Footer />
