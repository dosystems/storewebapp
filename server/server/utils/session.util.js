/**
 * 
 * @return {Session ID}
 *  
 */
function getSessionLoginID(req) {
    if (req.tokenInfo._id) {
        return req.tokenInfo._id;
    };
};

/**
 * 
 * @return {Session Name}
 *  
 */
function getSessionLoginName(req) {
    if (req.tokenInfo.companyName) {
        return req.tokenInfo.companyName;
    }else if (req.tokenInfo.displayName) {
        return req.tokenInfo.displayName;
    };
    if (req.tokenInfo.userName) {
        return req.tokenInfo.userName;
    };
    
};

/**
 * 
 * @return {Session Email}
 *  
 */
function getSessionLoginEmail(req) {
    if (req.tokenInfo.email) {
        return req.tokenInfo.email;
    };
    if (req.tokenInfo.emailid) {
        return req.tokenInfo.emailid;
    };
};

/**
 * 
 * @return {Session phoneNumber}
 *  
 */
function getSessionLoginPhone(req) {
    if (req.tokenInfo.phoneNumber) {
        return req.tokenInfo.phoneNumber;
    };
};

/**
 * 
 * @return {Session role}
 *  
 */
function getSessionLoginRole(req) {
    if (req.tokenInfo.role) {
        return req.tokenInfo.role;
    };
};

export default {
    getSessionLoginID,
    getSessionLoginName,
    getSessionLoginEmail,
    getSessionLoginPhone,
    getSessionLoginRole

}