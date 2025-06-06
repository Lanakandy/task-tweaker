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

            actions.appendChild(copyButton);

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(actions);
            variationsContainer.appendChild(card);
        });
    }
});