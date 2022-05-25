<script lang="ts">
	import { session } from '$app/stores';
	import { signInWith, signOut } from '$lib/client/firebase';
</script>

{#if $session.user}
	<button on:click={() => signOut()}>Sign Out</button>
	{$session.user.name} ({$session.user.email})
{:else}
	<button on:click={() => signInWith('google')}>Sign In with Google</button>
	(visitor)
{/if}
