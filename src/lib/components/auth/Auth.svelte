<script lang="ts">
	import { page } from '$app/stores';
	import { signInWith, signOut } from '$lib/client/firebase';
</script>

{#if $page.data.userSession}
	<button on:click={() => signOut()}>Sign Out</button>
	{$page.data.userSession.name} ({$page.data.userSession.email})
{:else}
	<button on:click={() => signInWith('google')}>Sign In with Google</button>
	(visitor)
{/if}
