// script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const generateButton = document.getElementById('generateButton');
    const variationsContainer = document.getElementById('variationsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputSubtitle = document.getElementById('outputSubtitle');

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showLoadingState(true);

        const formData = new FormData(taskForm);
        const taskDetails = {
            originalTask: formData.get('originalTask'),
            learningGoal: formData.get('learningGoal'),
            studentAge: formData.get('studentAge'),
            proficiencyLevel: formData.get('proficiencyLevel'),
            studentInterests: formData.get('studentInterests'),
            specificConstraints: formData.get('specificConstraints'),
        };

        try {
            const response = await fetch('/.netlify/functions/generate-variations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskDetails),
            });

            showLoadingState(false);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const { variations } = await response.json();
            displayVariations(variations);
            outputSubtitle.textContent = "Here are your generated task variations:";

        } catch (error) {
            showLoadingState(false);
            console.error('Error generating variations:', error);
            variationsContainer.innerHTML = `<p style="color: red;">Failed to generate variations: ${error.message}</p>`;
            outputSubtitle.textContent = "An error occurred.";
        }
    });

    function showLoadingState(isLoading) {
        if (isLoading) {
            generateButton.disabled = true;
            generateButton.innerHTML = '<span class="icon"></span> Generating...';
            loadingIndicator.style.display = 'block';
            variationsContainer.innerHTML = ''; // Clear previous results
        } else {
            generateButton.disabled = false;
            generateButton.innerHTML = '<span class="icon"></span> Generate Task Variations';
            loadingIndicator.style.display = 'none';
        }
    }

    function displayVariations(variations) {
        variationsContainer.innerHTML = ''; // Clear previous or loading messages
        if (!variations || variations.length === 0) {
            variationsContainer.innerHTML = '<p>No variations were generated. Try adjusting your inputs.</p>';
            return;
        }

        variations.forEach((variationText, index) => {
            const card = document.createElement('div');
            card.className = 'variation-card';

            const title = document.createElement('h3');
            const strongTitle = document.createElement('strong');
            strongTitle.textContent = `Variation ${index + 1}`;
            title.appendChild(strongTitle);
            // You might want to extract a sub-title from variationText if it follows a pattern
            // For now, we'll just use a generic title.

            const description = document.createElement('p');
            description.textContent = variationText;

            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.textContent = 'Copy';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(variationText)
                    .then(() => alert('Copied to clipboard!'))
                    .catch(err => console.error('Failed to copy: ', err));
            };

            // const downloadButton = document.createElement('button');
            // downloadButton.className = 'download-btn';
            // downloadButton.textContent = 'Download PDF';
            // downloadButton.onclick = () => {
            //     // PDF generation is more complex and would require a library
            //     alert('PDF download functionality not yet implemented.');
            // };

            actions.appendChild(copyButton);
            // actions.appendChild(downloadButton); // Add when ready

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(actions);
            variationsContainer.appendChild(card);
        });
    }

    // Add the SVG icon back to the generate button if you have one
    // This example assumes the icon was part of the initial HTML.
    // If the icon is an SVG string, you'd set generateButton.querySelector('.icon').innerHTML = svgString;
    // For now, the text change handles the loading state.
    const generateButtonIcon = generateButton.querySelector('.icon');
    if (generateButtonIcon) {
         // If you have a specific SVG for the button, ensure it's set or re-added here.
         // For simplicity, if the icon was just text or a placeholder, it's handled by innerHTML changes.
    }

});
```Make sure to link this script in your `index.html` before the closing `</body>` tag:
```html
    <script src="script.js"></script>
</body>
</html>