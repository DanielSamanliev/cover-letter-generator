document.addEventListener("DOMContentLoaded", function () {
  const inputTextArea = document.getElementById("input-text");
  const generateButton = document.getElementById("generate-btn");
  const jobDiv = document.getElementById("job");
  const outputDiv = document.getElementById("output");
  const downloadButton = document.getElementById("download");
  const loader = `<div class="loader"></div>`;

  const promptPretext = "Create a Cover Letter for the following job post.";
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = "{Your OpenAI API key}";

  chrome.storage.session.get(
    ["lastJob", "waitForNotes"],
    ({ lastJob, waitForNotes }) => {
      updateJobText(lastJob);

      if (!waitForNotes) {
        generateLetter(lastJob);
      }
    }
  );

  chrome.storage.session.onChanged.addListener((changes) => {
    const lastJobChange = changes["lastJob"];

    if (!lastJobChange) {
      return;
    }
    updateJobText(lastJobChange.newValue);
  });

  generateButton.addEventListener("click", function () {
    const inputText = inputTextArea.value;
    generateLetter(inputText);
  });

  function updateJobText(jobText) {
    jobDiv.innerText = jobText;
  }

  async function generateLetter(jobText, inputText = "") {
    try {
      downloadButton.style.display = "none"
      outputDiv.innerHTML = loader;
      const generatedLetter = await requestGeneratedText(jobText, inputText);
      outputDiv.innerText = generatedLetter;

      updateDownloadButton()
    } catch (error) {
      console.error("Error:", error);
      outputDiv.innerText = "An error occurred. Please try again later.";
    }
  }

  async function requestGeneratedText(jobText, inputText = "") {
    const messages = [
      { role: "user", content: promptPretext },
      { role: "user", content: jobText },
    ];

    if (inputText) {
      messages.push({ role: "user", content: inputText });
    }

    const requestBody = {
      model: "gpt-3.5-turbo-0125",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      n: 1,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    };
    const response = await fetch(apiUrl, requestOptions);

    if (!response.ok) {
      throw new Error("Failed to generate text: " + response.message);
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  }

  function updateDownloadButton() {
    downloadButton.style.display = "block";
  
    const fileName = "Cover Letter.doc";
    const content = outputDiv.innerText;
    var file = new Blob([content], { type: "text/plain" });
  
    downloadButton.setAttribute("href", window.URL.createObjectURL(file));
    downloadButton.setAttribute("download", fileName);
  }
});


