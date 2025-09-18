// Enhanced Clerk authentication with better error handling
let clerkInitialized = false;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Also try when window loads
window.addEventListener('load', initializeAuth);

function initializeAuth() {
    if (clerkInitialized) return;
    
    console.log('Initializing authentication...');
    
    // Setup sign-in button immediately with fallback
    setupSignInButton();
    
    // Wait for Clerk to load
    waitForClerk();
}

function setupSignInButton() {
    const signInBtn = document.getElementById('sign-in-btn');
    if (!signInBtn) {
        console.warn('Sign-in button not found');
        return;
    }
    
    // Set up click handler immediately
    signInBtn.onclick = handleSignInClick;
    signInBtn.style.cursor = 'pointer';
    signInBtn.disabled = false;
    
    console.log('Sign-in button configured');
}

function handleSignInClick(event) {
    event.preventDefault();
    console.log('Sign-in button clicked');
    
    if (window.Clerk && window.Clerk.openSignIn) {
        console.log('Opening Clerk sign-in modal...');
        window.Clerk.openSignIn();
    } else {
        console.log('Clerk not ready, showing fallback...');
        showFallbackSignIn();
    }
}

function showFallbackSignIn() {
    // Simple fallback - redirect to a sign-in page or show alert
    alert('Sign-in functionality is loading. Please try again in a moment.');
    
    // Or redirect to a sign-in page
    // window.location.href = '/signin';
}

function waitForClerk() {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds
    
    const checkClerk = setInterval(() => {
        attempts++;
        
        if (window.Clerk) {
            console.log('Clerk loaded successfully!');
            clearInterval(checkClerk);
            setupClerkAuth();
        } else if (attempts >= maxAttempts) {
            console.error('Clerk failed to load after 10 seconds');
            clearInterval(checkClerk);
            handleClerkLoadFailure();
        }
    }, 100);
}

async function setupClerkAuth() {
    try {
        console.log('Setting up Clerk authentication...');
        
        // Wait for Clerk to be fully ready
        await window.Clerk.load();
        
        clerkInitialized = true;
        console.log('Clerk authentication ready!');
        
        // Update UI based on auth state
        updateAuthUI();
        
        // Listen for auth state changes
        window.Clerk.addListener('user', updateAuthUI);
        
    } catch (error) {
        console.error('Clerk setup failed:', error);
        handleClerkLoadFailure();
    }
}

function handleClerkLoadFailure() {
    const signInBtn = document.getElementById('sign-in-btn');
    if (signInBtn) {
        signInBtn.innerHTML = 'Sign In (Fallback)';
        signInBtn.onclick = showFallbackSignIn;
    }
}

function updateAuthUI() {
    if (window.Clerk?.user) {
        showSignedIn();
    } else {
        showSignedOut();
    }
}

function showSignedIn() {
    console.log('Showing signed-in state');
    const signedOut = document.getElementById('clerk-signed-out');
    const signedIn = document.getElementById('clerk-signed-in');
    
    if (signedOut) signedOut.style.display = 'none';
    if (signedIn) {
        signedIn.classList.remove('hidden');
        signedIn.style.display = 'flex';
    }
    
    // Mount user button if available
    const userButton = document.getElementById('clerk-user-button');
    if (userButton && window.Clerk?.user && window.Clerk.mountUserButton) {
        try {
            window.Clerk.mountUserButton(userButton);
        } catch (error) {
            console.error('Failed to mount user button:', error);
            // Fallback: show user info
            userButton.innerHTML = `<span class="text-white">${window.Clerk.user.firstName || 'User'}</span>`;
        }
    }
}

function showSignedOut() {
    console.log('Showing signed-out state');
    const signedOut = document.getElementById('clerk-signed-out');
    const signedIn = document.getElementById('clerk-signed-in');
    
    if (signedOut) {
        signedOut.style.display = 'block';
    }
    if (signedIn) {
        signedIn.classList.add('hidden');
        signedIn.style.display = 'none';
    }
}

// Enhanced API for other scripts
window.clerkAuth = {
    isSignedIn: () => !!window.Clerk?.user,
    getCurrentUser: () => window.Clerk?.user || null,
    signOut: async () => {
        if (window.Clerk?.signOut) {
            try {
                await window.Clerk.signOut();
                updateAuthUI();
            } catch (error) {
                console.error('Sign out failed:', error);
            }
        }
    },
    openSignIn: () => {
        if (window.Clerk?.openSignIn) {
            window.Clerk.openSignIn();
        } else {
            showFallbackSignIn();
        }
    },
    isReady: () => clerkInitialized
};
