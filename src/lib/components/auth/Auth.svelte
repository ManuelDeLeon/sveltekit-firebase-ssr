<script lang="ts">
	import { session } from '$app/stores';
	import { signInWith, signOut } from '$lib/utils/firebase';
	let thisSession: any;
	$: thisSession = $session;
</script>

{#if thisSession.user}
	<button on:click={() => signOut()}>Sign Out</button>
	{thisSession.user.name} ({thisSession.user.email})
{:else}
	<button on:click={() => signInWith('google')}>Sign In with Google</button>
	(visitor)
{/if}
