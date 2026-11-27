
import { supabase } from "./supabase.js";

console.log("TVA Password Reset connected!");

// ==========================================
// ELEMENTS
// ==========================================

const resetForm = document.getElementById("reset-form");
const statusMessage = document.getElementById("status-message");
const resetMessage = document.getElementById("reset-message");

const submitButton = resetForm.querySelector('button[type="submit"]');

let recoverySessionReady = false;


// ==========================================
// 1. RECOVERY SESSION
// ==========================================

function showResetForm() {

    recoverySessionReady = true;

    resetForm.hidden = false;

    statusMessage.textContent =
        "Reset link verified. Create your new password.";

}

function showInvalidLink() {

    statusMessage.textContent =
        "This password reset link is invalid or has expired. Please request a new one.";

}


// Listen for Supabase authentication events

const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {

        if (event === "PASSWORD_RECOVERY" && session) {

            showResetForm();

        }

    }
);


// Check existing session

async function checkRecoverySession() {

    try {

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {

            showResetForm();

        } else {

            showInvalidLink();

        }

    } catch (error) {

        console.error(error);

        showInvalidLink();

    }

}

checkRecoverySession();


// ==========================================
// 2. SHOW / HIDE PASSWORD
// ==========================================

const toggleButtons = document.querySelectorAll(".toggle-password");

toggleButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const input = document.getElementById(button.dataset.target);

        const isHidden = input.type === "password";

        input.type = isHidden ? "text" : "password";

        button.textContent = isHidden ? "Hide" : "Show";

    });

});


// ==========================================
// 3. UPDATE PASSWORD
// ==========================================

resetForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!recoverySessionReady) {

        resetMessage.textContent =
            "Please request a new password reset link.";

        return;

    }

    const newPassword =
        document.getElementById("new-password").value;

    const confirmPassword =
        document.getElementById("confirm-password").value;


    if (newPassword.length < 8) {

        resetMessage.textContent =
            "Password must contain at least 8 characters.";

        return;

    }


    if (newPassword !== confirmPassword) {

        resetMessage.textContent =
            "Passwords do not match.";

        return;

    }


    submitButton.disabled = true;

    submitButton.textContent = "Updating Password...";

    resetMessage.textContent = "";


    try {

        const { error } = await supabase.auth.updateUser({

            password: newPassword

        });

        if (error) throw error;


        resetMessage.textContent =
            "Password updated successfully! Redirecting to login...";

        resetForm.hidden = true;

        await supabase.auth.signOut();

        setTimeout(() => {

            window.location.href = "index.html";

        }, 2000);


    } catch (error) {

        resetMessage.textContent = error.message;

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Update Password";

    }

});
