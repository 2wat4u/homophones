let homophonesData = {}; // Stocke les données JSON
let selectedWords = []; // Contiendra les mots sélectionnés pour filtrer les phrases
let currentWord = ''; // Le mot actuel
let currentPhrase = ''; // La phrase actuelle

// Charger les données JSON lors du chargement de la page
window.onload = async () => {
    try {
        const response = await fetch('homophones_output.json');
        homophonesData = await response.json();
        populateGroupSelect();
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
    }
};

// Remplit la liste déroulante des groupes
function populateGroupSelect() {
    const groupSelect = document.getElementById('group-select');
    homophonesData.homophones.forEach(group => {
        const option = document.createElement('option');
        option.value = group.group.join(',');
        option.textContent = group.group.join(' - ');
        groupSelect.appendChild(option);
    });
}

// Met à jour les mots associés à un groupe
function updateWords() {
    const groupSelect = document.getElementById('group-select');
    const selectedGroup = groupSelect.value.split(',');

    const wordsContainer = document.getElementById('word-list');
    wordsContainer.innerHTML = ''; // Vider les mots précédents

    const groupData = homophonesData.homophones.find(g =>
        selectedGroup.every(gWord => g.group.includes(gWord))
    );

    if (groupData) {
        groupData.words.forEach(word => {
            const wordContainer = document.createElement('div');
            wordContainer.classList.add('word-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${word.homo}`;
            checkbox.value = word.homo;
            checkbox.checked = true; // Par défaut, tous les mots sont sélectionnés
            checkbox.onchange = updateSelectedWords;

            const label = document.createElement('label');
            label.htmlFor = `checkbox-${word.homo}`;
            label.textContent = word.homo;

            wordContainer.appendChild(checkbox);
            wordContainer.appendChild(label);
            wordsContainer.appendChild(wordContainer);
        });

        // Initialiser les mots sélectionnés avec tous les mots
        selectedWords = groupData.words.map(w => w.homo);
    }
}

// Met à jour la liste des mots sélectionnés
function updateSelectedWords() {
    const checkboxes = document.querySelectorAll('#word-list input[type="checkbox"]');
    selectedWords = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

// Génère une phrase filtrée
function generateFilteredPhrase() {
    const groupSelect = document.getElementById('group-select');
    const selectedGroup = groupSelect.value.split(',');

    const groupData = homophonesData.homophones.find(g =>
        selectedGroup.every(gWord => g.group.includes(gWord))
    );

    if (groupData) {
        const filteredWords = groupData.words.filter(w => selectedWords.includes(w.homo));
        if (filteredWords.length > 0) {
            const randomWordData = filteredWords[Math.floor(Math.random() * filteredWords.length)];
            let randomPhrase = randomWordData.phrases[Math.floor(Math.random() * randomWordData.phrases.length)];
            currentWord = randomWordData.homo;

            // Remplace le mot cible par '___'
            const maskedPhrase = randomPhrase.replace(new RegExp(`\\b${currentWord}\\b`, 'g'), '___');
            currentPhrase = maskedPhrase;

            // Récupère l'élément de la phrase
            const phraseElement = document.getElementById('generated-phrase');

            // Ajoute la nouvelle phrase
            phraseElement.textContent = maskedPhrase;

            // Applique la classe d'animation
            phraseElement.classList.add('fade-in');

            // Supprime la classe d'animation après la fin de l'animation
            setTimeout(() => {
                phraseElement.classList.remove('fade-in');
            }, 500); // 500ms correspond à la durée de l'animation
        } else {
            document.getElementById('generated-phrase').textContent = "Aucun mot sélectionné pour générer une phrase.";
        }
    }
}



// Affiche un message temporaire et génère une nouvelle question après 2 secondes
function showTemporaryMessage(message, isCorrect) {
    const messageElement = document.getElementById('temporary-message');

    // Mettre à jour le texte et la couleur de fond selon la réponse
    messageElement.textContent = message;
    messageElement.style.backgroundColor = isCorrect ? '#4CAF50' : '#dc3545';

    // Afficher la bannière
    messageElement.style.display = 'block';

    // Masquer la bannière et générer une nouvelle question après 2 secondes
    setTimeout(() => {
        messageElement.style.display = 'none';
        generateFilteredPhrase(); // Génère une nouvelle phrase uniquement après le message
    }, 2000);
}

// Valider la réponse utilisateur
document.getElementById('validate-button').onclick = () => {
    const userInput = document.getElementById('user-input').value.trim();

    if (userInput === currentWord) {
        showTemporaryMessage('Bravo, bonne réponse !', true);
    } else {
        showTemporaryMessage(`La réponse était "${currentWord}".`, false);
    }

    // Effacer le champ de saisie
    document.getElementById('user-input').value = '';
};

// Détecter la touche Entrée pour actionner le bouton Valider
document.getElementById('user-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('validate-button').click(); // Déclenche un clic sur le bouton Valider
    }
});

// Génération de la phrase filtrée
document.getElementById('apply-filter').addEventListener('click', generateFilteredPhrase);
