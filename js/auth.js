
import { supabase } from "./supabase.js";

console.log("TVA Supabase Authentication connected!");


// ==========================================
// 1. SIGNUP
// ==========================================

const signupForm = document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =document.getElementById("confirm-password").value;
        const message = document.getElementById("signup-message");
        const button = signupForm.querySelector('button[type="submit"]');
        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }
        message.textContent = "";

        button.disabled = true;
        button.textContent = "Creating account...";

        try {

            const { data, error } = await supabase.auth.signUp({

                email: email,
                password: password,

                options: {
                    data: {
                        full_name: name
                    },
                    emailRedirectTo:
                        "https://sreehari-ms811.github.io/Task-Tracker/index.html"
                 }

});

            if (error) throw error;

            if (data.session) {

                message.textContent = "Account created successfully!";

                window.location.href = "dashboard.html";

            } else {

                message.textContent =
                    "Account created! Please verify your email before logging in.";

            }

        } catch (error) {

            message.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Create Account";

        }

    });

}



// ==========================================
// 2. LOGIN
// ==========================================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("login-message");
        const button = loginForm.querySelector('button[type="submit"]');

        message.textContent = "";

        button.disabled = true;
        button.textContent = "Logging in...";

        try {

            const { data, error } = await supabase.auth.signInWithPassword({

                email: email,
                password: password

            });

            if (error) throw error;

            message.textContent = "Login successful!";

            window.location.href = "dashboard.html";

        } catch (error) {

            message.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Login";

        }

    });

}



// ==========================================
// 3. SHOW / HIDE PASSWORD
// ==========================================

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("toggle-password");

if (passwordInput && togglePassword) {

    togglePassword.addEventListener("click", () => {

        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";

        togglePassword.textContent = isHidden ? "Hide" : "Show";

        togglePassword.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            String(isHidden)
        );

    });

}



// ==========================================
// 4. FORGOT PASSWORD
// ==========================================

const forgotPasswordLink = document.getElementById("forgot-password");

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener("click", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        const message = document.getElementById("reset-message");

        if (!email) {

            message.textContent = "Please enter your registered email first.";

            return;

        }

        message.textContent = "Sending password reset email...";

        try {

            const { error } = await supabase.auth.resetPasswordForEmail(

                email,

                {
                    redirectTo: new URL(
                        "reset-password.html",
                        window.location.href
                    ).href
                }

            );

            if (error) throw error;

            message.textContent =
                "Password reset link sent! Please check your email.";

        } catch (error) {

            message.textContent = error.message;

        }

    });

}
