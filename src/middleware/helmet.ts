import helmet from 'helmet';

const  helmetContentSecurityPolicy = {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
        scriptSrc: ["'self'", 'code.jquery.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    },
}

export {
    helmet,
    helmetContentSecurityPolicy,
}
