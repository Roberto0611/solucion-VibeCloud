import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Put your logo image at public/LogoCloud.png. If absent, you can keep the SVG icon as fallback (uncomment below). */}
                <img
                    src="/LogoCloud.png"
                    alt="DriveCloud"
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                        // Hide image element if it fails to load so the fallback SVG can be visible
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
                {/* Fallback SVG (kept for safety) */}
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    DriveCloud
                </span>
            </div>
        </>
    );
}
