"use client";

import { useState } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [gujaratiInfo, setGujaratiInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const analyzePlantHealth = async () => {
    if (!userConsent) {
      setPlantInfo("Please provide consent to use the AI service before proceeding.");
      return;
    }
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyAXSiX_i2qtV1s3o4ocRxa6_L2ceRCKr1A");
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
  
      const prompt = `Analyze this plant image and provide the following information:
      1. Plant identification (if possible)
      2. Overall health assessment
      3. Any visible signs of disease, pest infestation, or nutritional deficiencies
      4. Recommendations for care or treatment if issues are detected
      5. Detailed solutions for any detected diseases or problems
      Please be as detailed as possible in your analysis.`;
  
      const imageParts = [
        {
          codeExecutionResult: await fileToGenerativePart(file), // Correct field name based on the error
          mimeType: file.type,
        }
      ];
  
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = await response.text(); // Ensure proper response handling
      setPlantInfo(text);
  
      // Generate Gujarati translation
      const gujaratiPrompt = `Translate the following plant analysis to Gujarati:
      ${text}`;
  
      const gujaratiResult = await model.generateContent([gujaratiPrompt]);
      const gujaratiResponse = await gujaratiResult.response;
      const gujaratiText = await gujaratiResponse.text();
      setGujaratiInfo(gujaratiText);
    } catch (error) {
      console.error("Error analyzing plant health:", error);
      setPlantInfo("Error analyzing plant health. Please try again.");
      setGujaratiInfo("ભૂલ: છોડનું સ્વાસ્થ્ય વિશ્લેષણ કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
    }
    setLoading(false);
  };

  const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-6 text-green-800 text-center">
            Plant Health Analyzer
          </h1>
          <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">
            છોડ સ્વાસ્થ્ય વિશ્લેષક
          </h2>
          <p className="mb-6 text-gray-600 text-center">
            Upload an image of your plant for health analysis and problem
            detection.
            <br />
            તમારા છોડની છબી અપલોડ કરો સ્વાસ્થ્ય વિશ્લેષણ અને સમસ્યા શોધ માટે.
          </p>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userConsent}
                onChange={(e) => setUserConsent(e.target.checked)}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <span className="ml-2 text-gray-700">
                I consent to the processing of my uploaded image by an AI
                service.
              </span>
            </label>
          </div>

          <div className="mb-6">
            <label
              htmlFor="plant-image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload a plant image / છોડની છબી અપલોડ કરો
            </label>
            <input
              type="file"
              id="plant-image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
          </div>
          {preview && (
            <div className="mb-6 flex justify-center">
              <Image
                src={preview}
                alt="Plant preview"
                width={300}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <button
            onClick={analyzePlantHealth}
            disabled={!file || loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50 text-lg font-semibold"
          >
            {loading
              ? "Analyzing... / વિશ્લેષણ કરી રહ્યું છે..."
              : "Analyze Plant Health / છોડનું સ્વાસ્થ્ય વિશ્લેષણ કરો"}
          </button>
          {plantInfo && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold mb-4 text-green-800">
                Plant Analysis / છોડનું વિશ્લેષણ:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700">
                    English
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {plantInfo}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700">
                    ગુજરાતી
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {gujaratiInfo}
                  </p>

                  <p className="mt-4 text-sm text-gray-500">
                    Note: This analysis is generated by an AI and may not be
                    100% accurate. For critical plant health issues, please
                    consult a professional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
