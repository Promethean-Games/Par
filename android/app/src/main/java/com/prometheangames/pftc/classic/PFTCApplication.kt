package com.prometheangames.pftc.classic

import android.app.Application
import com.google.android.gms.games.PlayGamesSdk

class PFTCApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        PlayGamesSdk.initialize(this)

        enableReviewModeUnlock()
    }

    private fun enableReviewModeUnlock() {
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)

        // REVIEW MODE SWITCH (turn OFF after approval)
        val isReviewMode = true

        if (isReviewMode) {
            prefs.edit()
                .putBoolean("isPremium", true)
                .apply()
        }
    }
}
