const SUBJECTS = [
  { id: 'ideology and constitution of Pakistan', name: 'Ideology and Constitution of Pakistan', short: 'PST' },
  { id: 'Understanding of Holy Quran-II', name: 'Understanding of Holy Quran-II', short: 'Quran' },
  { id: 'Expository Writing', name: 'Expository Writing', short: 'English' },
  { id: 'Pre-Calculus-II', name: 'Pre-Calculus-II', short: 'PC' },
  { id: 'Digital and logic design', name: 'Digital and Logic Design', short: 'DLD' },
  { id: 'object-oriented', name: 'Object-Oriented Programming', short: 'OOP' },
  { id: 'discrete-math', name: 'Discrete Mathematics', short: 'DM' },
  { id: 'Multivariable Calculas', name: 'Multivariable Calculas', short: 'MC' },
];

const STORAGE_KEY = 'cs-notes-archive';

const state = {
  selectedSubject: 'all',
  notes: loadNotes(),
};

const subjectGrid = document.getElementById('subjectGrid');
const subjectSelect = document.getElementById('noteSubject');
const noteGrid = document.getElementById('noteGrid');
const activeSubjectTitle = document.getElementById('activeSubjectTitle');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Could not read stored notes:', error);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getSubjectById(subjectId) {
  return SUBJECTS.find((subject) => subject.id === subjectId) ?? null;
}

function getFilteredNotes() {
  if (state.selectedSubject === 'all') {
    return [...state.notes].reverse();
  }

  return state.notes
    .filter((note) => note.subject === state.selectedSubject)
    .reverse();
}

function renderSubjectOptions() {
  subjectSelect.innerHTML = SUBJECTS.map(
    (subject) =>
      `<option value="${subject.id}">${subject.name}</option>`
  ).join('');
}

function renderSubjectGrid() {
  const cardMarkup = SUBJECTS.map((subject) => {
    const count = state.notes.filter((note) => note.subject === subject.id).length;
    const selected = state.selectedSubject === subject.id ? 'selected' : '';

    return `
      <button class="subject-card ${selected}" data-subject="${subject.id}" type="button">
        <div class="meta">
          <span class="subject-tag">${subject.short}</span>
          <span class="subject-count">${count}</span>
        </div>
        <span class="subject-name">${subject.name}</span>
        <small>notes</small>
      </button>
    `;
  }).join('');

  subjectGrid.innerHTML = cardMarkup;

  document.querySelectorAll('.subject-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedSubject = card.dataset.subject;
      renderSubjectGrid();
      renderNotes();
    });
  });

  const activeButton = document.getElementById('allSubjectsBtn');
  activeButton.classList.toggle('active', state.selectedSubject === 'all');
}

function renderNotes() {
  const filteredNotes = getFilteredNotes();
  const selectedSubject = getSubjectById(state.selectedSubject);

  activeSubjectTitle.textContent = selectedSubject ? selectedSubject.name : 'All notes';

  if (!filteredNotes.length) {
    noteGrid.innerHTML = `
      <div class="empty-state">
        <p>No image notes yet for this subject.</p>
      </div>
    `;
    return;
  }

  noteGrid.innerHTML = filteredNotes
    .map(
      (note) => `
        <article class="note-card">
          <img src="${note.imageData}" alt="${note.title}" />
          <div class="note-body">
            <h4>${note.title}</h4>
            <p>${note.description || 'No additional note description.'}</p>
            <div class="note-meta">
              <span>${getSubjectById(note.subject)?.name ?? 'General'}</span>
              <span>${formatDate(note.createdAt)}</span>
            </div>
            <div class="note-meta">
              <span></span>
              <button class="note-action" data-id="${note.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.note-action').forEach((button) => {
    button.addEventListener('click', () => {
      const noteId = button.dataset.id;
      state.notes = state.notes.filter((note) => note.id !== noteId);
      saveNotes();
      renderSubjectGrid();
      renderNotes();
    });
  });
}

function openModal(subjectId = state.selectedSubject) {
  if (subjectId !== 'all') {
    subjectSelect.value = subjectId;
  } else {
    subjectSelect.value = SUBJECTS[0].id;
  }

  noteModal.classList.remove('hidden');
  noteModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  noteModal.classList.add('hidden');
  noteModal.setAttribute('aria-hidden', 'true');
  noteForm.reset();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('noteTitle').value.trim();
  const subject = document.getElementById('noteSubject').value;
  const description = document.getElementById('noteDescription').value.trim();
  const fileInput = document.getElementById('noteImage');
  const imageFile = fileInput.files[0];

  if (!title || !subject || !imageFile) {
    return;
  }

  if (!imageFile.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const newNote = {
      id: crypto.randomUUID(),
      title,
      subject,
      description,
      imageData: reader.result,
      createdAt: new Date().toISOString(),
    };

    state.notes.push(newNote);
    saveNotes();
    renderSubjectGrid();
    renderNotes();
    closeModal();
  };

  reader.readAsDataURL(imageFile);
}

function bindEvents() {
  document.getElementById('newNoteBtn').addEventListener('click', () => openModal());
  document.getElementById('uploadBtn').addEventListener('click', () => openModal());
  document.getElementById('allSubjectsBtn').addEventListener('click', () => {
    state.selectedSubject = 'all';
    renderSubjectGrid();
    renderNotes();
  });
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  noteModal.addEventListener('click', (event) => {
    if (event.target === noteModal) {
      closeModal();
    }
  });
  noteForm.addEventListener('submit', handleFormSubmit);
}

renderSubjectOptions();
renderSubjectGrid();
renderNotes();
bindEvents();
