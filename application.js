// ---------------- Supabase Setup ----------------
const SUPABASE_URL = 'https://cqjcgokpbakongeipkzi.supabase.co'; // replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxamNnb2twYmFrb25nZWlwa3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTQyNTgsImV4cCI6MjA3MjczMDI1OH0.4yjN-6AAj2FLRF-BerZ9JWMS9Lf2eUVJ-uWb7PwiyHs'; // replace with your anon key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------- Modal Functions ----------------
function openApplicationModal(internshipTitle) {
    if (!window.clerkAuth?.isSignedIn()) {
        alert('Please sign in to apply for internships.');
        if (window.clerkAuth) document.getElementById('sign-in-btn').click();
        return;
    }
    document.getElementById('applicationModal').classList.remove('hidden');
    document.getElementById('applicationTitle').textContent = `Apply for: ${internshipTitle}`;
    document.body.style.overflow = 'hidden';
}

function closeApplicationModal() {
    document.getElementById('applicationModal').classList.add('hidden');
    document.getElementById('applicationForm').reset();
    document.body.style.overflow = 'auto';
}

function showSuccessNotification() {
    const notification = document.getElementById('successNotification');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// ---------------- File Upload Helper ----------------
async function uploadFile(file, folder) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from('applications') // make sure you created a bucket named 'applications'
        .upload(fileName, file);

    if (error) {
        throw error;
    }

    // Get public URL
    const { publicUrl, error: urlError } = supabase.storage
        .from('applications')
        .getPublicUrl(fileName);

    if (urlError) throw urlError;

    return publicUrl;
}

// ---------------- Form Submission ----------------
document.addEventListener('DOMContentLoaded', function () {
    const applicationForm = document.getElementById('applicationForm');
    if (!applicationForm) return;

    applicationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('applicationSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Collect basic form data
            const formData = {
                full_name: document.getElementById('applicantName').value,
                email: document.getElementById('applicantEmail').value,
                phone_number: document.getElementById('applicantPhone').value,
                dob: document.getElementById('applicantDOB').value,
                highest_qualification: document.getElementById('applicantQualification').value,
                field_of_study: document.getElementById('applicantField').value,
                university_college: document.getElementById('applicantUniversity').value,
                cgpa_percent: document.getElementById('applicantCGPA').value,
                start_date: document.getElementById('applicantStartDate').value,
                availability: document.getElementById('applicantAvailability').value
            };

            // Validate required fields
            for (let key of ['full_name','email','phone_number','dob']) {
                if (!formData[key]) {
                    alert('Please fill all required fields.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit';
                    return;
                }
            }

            // Upload files
            const resumeFile = document.getElementById('applicantResume').files[0];
            const transcriptFile = document.getElementById('applicantTranscripts').files[0];
            const coverLetterFile = document.getElementById('applicantCoverLetter').files[0];

            formData.resume_url = await uploadFile(resumeFile, 'resumes');
            formData.academic_transcripts_url = await uploadFile(transcriptFile, 'transcripts');
            formData.cover_letter_url = await uploadFile(coverLetterFile, 'coverletters');

            // Insert into Supabase table
            const { data, error } = await supabase
                .from('applications')
                .insert([formData]);

            if (error) throw error;

            closeApplicationModal();
            showSuccessNotification();

        } catch (err) {
            console.error(err);
            alert('Error submitting application: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });
});
