


export function createPageUrl(pageName: string) {
    // Map page names to their actual route paths
    const routeMap: { [key: string]: string } = {
        'Welcome': '/welcome',
        'VendorLogin': '/vendor-login',
        'VendorRegistration': '/vendor-registration',
        'UserRegistration': '/user-registration',
        'UserLogin': '/user-login',
        'QRScanner': '/qr-scanner',
        'CustomerMenu': '/customer-menu',
        'CustomerOrder': '/customer-order',
        'CustomerProfile': '/customer-profile',
        'Dashboard': '/dashboard',
        'MenuManagement': '/menu-management',
        'Orders': '/orders',
        'QRGenerator': '/qr-generator',
        'Analytics': '/analytics'
    };
    
    return routeMap[pageName] || '/' + pageName.toLowerCase().replace(/ /g, '-');
}