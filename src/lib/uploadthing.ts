// Direct upload to UploadThing using their API
// Docs: https://docs.uploadthing.com/api-reference/ut-api

export async function uploadToUploadThing(file: File): Promise<string> {
  const token = import.meta.env.VITE_UPLOADTHING_TOKEN;
  
  if (!token) {
    throw new Error("UploadThing token not configured. Please set VITE_UPLOADTHING_TOKEN in your .env.local file");
  }

  try {
    // Step 1: Request presigned URL from UploadThing
    const presignedResponse = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": token,
      },
      body: JSON.stringify({
        files: [{
          name: file.name,
          size: file.size,
          type: file.type,
        }],
        acl: "public-read",
      }),
    });

    if (!presignedResponse.ok) {
      const error = await presignedResponse.text();
      throw new Error(`Failed to get upload URL: ${error}`);
    }

    const presignedData = await presignedResponse.json();
    console.log("Presigned response:", presignedData);
    
    const uploadData = presignedData.data[0];
    const fileKey = uploadData.key;

    // Step 2: Upload file to the presigned URL
    const formData = new FormData();
    
    // Add all required fields from UploadThing
    Object.entries(uploadData.fields || {}).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    // File must be appended last
    formData.append("file", file);

    const uploadResponse = await fetch(uploadData.url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload response error:", errorText);
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Step 3: Poll for upload completion (optional but recommended)
    let pollCount = 0;
    const maxPolls = 10;
    
    while (pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      
      const statusResponse = await fetch(`https://api.uploadthing.com/v6/pollUpload/${fileKey}`, {
        headers: {
          "X-Uploadthing-Api-Key": token,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === "uploaded") {
          // Return the UploadThing CDN URL
          return `https://utfs.io/f/${fileKey}`;
        }
      }
      
      pollCount++;
    }

    // If polling fails, still return the CDN URL
    // UploadThing uses this format: https://utfs.io/f/{key}
    return `https://utfs.io/f/${fileKey}`;
    
  } catch (error: any) {
    console.error("UploadThing error:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

