import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkModeSignal = signal<boolean>(false);

    isDark = computed(() => this.darkModeSignal());

    constructor() {
        // Check local storage or system preference
        const saved = localStorage.getItem('theme');
        if (saved) {
            this.darkModeSignal.set(saved === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.darkModeSignal.set(prefersDark);
        }

        // Effect to apply class
        effect(() => {
            const isDark = this.darkModeSignal();
            if (isDark) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggleTheme() {
        this.darkModeSignal.update(val => !val);
    }
}
