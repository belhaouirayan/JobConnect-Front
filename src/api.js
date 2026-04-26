export const BASE_URL = 'http://127.0.0.1:8000/api';

// Session timeout duration (2 hours in milliseconds)
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

// Check if session is valid
export const checkSession = () => {
  const token = localStorage.getItem('token');
  const loginTime = localStorage.getItem('loginTime');

  if (!token || !loginTime) {
    return false;
  }

  const currentTime = new Date().getTime();
  const timeElapsed = currentTime - parseInt(loginTime);

  // Check if session has expired
  if (timeElapsed > SESSION_TIMEOUT) {
    // Clear expired session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('role');
    return false;
  }

  return true;
};

// Get remaining session time
export const getRemainingSessionTime = () => {
  const loginTime = localStorage.getItem('loginTime');
  
  if (!loginTime) return 0;
  
  const currentTime = new Date().getTime();
  const timeElapsed = currentTime - parseInt(loginTime);
  const remainingTime = SESSION_TIMEOUT - timeElapsed;
  
  return Math.max(0, remainingTime);
};

// Enhanced apiRequest function that handles both relative and absolute URLs
export async function apiRequest(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  const loginTime = localStorage.getItem("loginTime");

  console.group("🔍 API Request Debug");
  console.log("URL:", url);
  console.log("Method:", method);
  console.log("Token present:", !!token);
  console.log("Login time:", loginTime ? new Date(parseInt(loginTime)).toLocaleString() : "none");

  // Check if session has expired
  if (token && loginTime) {
    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - parseInt(loginTime);
    const remainingMs = SESSION_TIMEOUT - timeElapsed;
    
    console.log("Session elapsed:", Math.floor(timeElapsed / 1000), "seconds");
    console.log("Session remaining:", Math.floor(remainingMs / 1000), "seconds");
    
    if (timeElapsed > SESSION_TIMEOUT) {
      console.error("❌ Session expired!");
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('role');
      console.groupEnd();
      
      // Redirect to login
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
  } else if (!token) {
    console.warn("⚠️  No token found - user may not be logged in!");
  }

  // Determine the full URL
  let fullUrl;
  if (url.startsWith('http')) {
    fullUrl = url;
  } else if (url.startsWith('/api/')) {
    fullUrl = `${BASE_URL}${url.substring(4)}`;
  } else if (url.startsWith('/')) {
    fullUrl = `${BASE_URL}${url}`;
  } else {
    fullUrl = `${BASE_URL}/${url}`;
  }
  
  console.log("Full URL:", fullUrl);

  // For FormData, let the browser set the Content-Type header with boundary
  const headers = {
    "Accept": "application/json",
  };

  // Only set Content-Type for JSON, not for FormData
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header set");
  } else {
    console.warn("⚠️  No Authorization header will be sent");
  }

  const options = { method, headers };
  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  console.log("Request options:", {
    method: options.method,
    headers: Object.keys(options.headers),
    bodyType: body instanceof FormData ? "FormData" : "JSON"
  });

  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    
    // Handle 401 Unauthorized - Token is invalid or session lost
    if (response.status === 401) {
      console.error("❌ Session invalid or expired (401). Clearing storage...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('role');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    }

    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    console.error("Error details:", {
      status: response.status,
      message: errorMessage,
      token: token ? "present" : "missing"
    });
    
    console.groupEnd();
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    console.log("✅ Response received:", { status: response.status, dataType: 'none' });
    console.groupEnd();
    return null;
  }

  const text = await response.text();
  const responseData = text ? JSON.parse(text) : null;
  
  console.log("✅ Response received:", {
    status: response.status,
    dataType: Array.isArray(responseData) ? "array" : typeof responseData,
    itemCount: Array.isArray(responseData) ? responseData.length : "n/a"
  });
  console.groupEnd();
  
  return responseData;
}

// ============================================================================
// NOUVEAU : Fonction pour envoyer la candidature avec les multiples documents
// ============================================================================
export const submitCandidature = async (offreId, formData, docs) => {
  const data = new FormData();
  
  // 1. Ajout des données textuelles
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      data.append(key, formData[key]);
    }
  });
  data.append('offre_id', offreId);

  // 2. Ajout des fichiers (on vérifie que chaque fichier existe avant de l'ajouter)
  if (docs.cv) data.append('cv', docs.cv);
  if (docs.permit) data.append('permis', docs.permit);
  if (docs.diplome) data.append('diplome', docs.diplome);
  if (docs.habitation) data.append('habilitation', docs.habitation);
  if (docs.lettre_doc) data.append('lettre_doc', docs.lettre_doc);
  if (docs.autres) data.append('autres', docs.autres);

  // 3. Envoi à l'API (ton apiRequest détecte automatiquement que c'est un FormData)
  return await apiRequest('/candidats', 'POST', data);
};