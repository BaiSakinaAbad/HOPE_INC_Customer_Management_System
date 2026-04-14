Checked by: M1 AND M5

# Changelog
All notable changes to the HOPE, INC. CMS project will be documented here.

# [Unreleased]
## [v0.1] - March 27, 2026
### Added 
- Project setup and initial documentation
- Project scaffolding initialized with vite and tailwind css
- branch protection rules
- branch created: main, dev, scaffold -> @BaiSakinaAbad

## [v0.2] - March 30, 2026
### Added
- Added new Login and Register UI styling with light and dark mode toggling -> @sairarat
- Pr approved -> @KlyneZyro
- Created all/docs branch solely for documentation -> @BaiSakinaAbad

### Fixed
- Cleaned dev and main folder by removing unnecessary files -> @BaiSakinaAbad

## [v0.3] - March 31, 2026
### Fixed
- Fixed the File Layout to apply proper Atomic Design Pattern. Also added Password Logic Checker that checks -> @sairarat

## [v0.4] - April 1, 2026
### Added
-  Added user-authentication. Allows for logging in and signing up -> @solanov

## [v0.5] - April 2, 2026
### Added
- Database creation -> @PejaLattrell

## [v0.6] - April 4, 2026
### Fixed
- Feat: adjusted AuthComposites -> @solanov
- Successfully Added Super Admin Dashboard and Loading Spinner UI -> @sairarat

## [v0.7] - April 12 2026
### Added
- Feat: We added a new account state called "blocked"
Blocked accounts will not be able to access the application.
This is different from "inactive" as inactive accounts are just not logged in (for 30 days), while blocked accounts are banned from using the application.
- Feat: "for approval" status is added for new registered accounts. This is only applicable for accounts that registered (not sign in). 
- all members are consulted with this changes.

### Fixed
- Feat: adjusted AuthComposites -> @solanov

