export async function getUserData() {
  try {
    const token = await localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("User data:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
}
