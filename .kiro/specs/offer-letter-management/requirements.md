# Requirements Document

## Introduction

The Offer Letter Management feature enables HR administrators to create, manage, and track offer letters for candidates in the HRMS Recruitment module. This feature provides a complete workflow from template upload through candidate-specific customization to final PDF generation and status tracking. The system integrates with existing Employee and User models and supports role-based access control for Admin and HR Manager roles.

## Glossary

- **Offer_Letter_System**: The complete offer letter management subsystem within the HRMS Recruitment module
- **Template_Manager**: The component responsible for uploading and storing offer letter templates
- **Offer_Letter_Editor**: The component that allows editing of candidate-specific information in offer letters
- **PDF_Generator**: The component that converts offer letter content to downloadable PDF format
- **Status_Tracker**: The component that monitors and updates offer letter status
- **Admin**: User with role "admin" who has full access to create, edit, and manage offer letters
- **HR_Manager**: User with role "manager" who can view and download offer letters
- **Candidate_Record**: An Employee or User record representing a job candidate
- **Template_File**: A PDF or Word document serving as the base format for offer letters
- **Offer_Letter_Record**: A database entity storing offer letter data linked to a candidate
- **Offer_Letter_Status**: The current state of an offer letter (DRAFT, ISSUED, ACCEPTED, REJECTED)
- **File_Storage**: The system component responsible for persisting uploaded files and generated PDFs
- **Backend_API**: The Java Spring Boot REST API layer
- **Frontend_UI**: The React-based user interface
- **Database**: The MongoDB database storing offer letter records

## Requirements

### Requirement 1: Upload Offer Letter Template

**User Story:** As an Admin, I want to upload offer letter templates in PDF or Word format, so that I can use my company's standard format for all offer letters.

#### Acceptance Criteria

1. WHEN an Admin uploads a file, THE Template_Manager SHALL validate that the file format is PDF or DOCX
2. IF the uploaded file is not PDF or DOCX, THEN THE Template_Manager SHALL return an error message indicating invalid file format
3. WHEN a valid template file is uploaded, THE File_Storage SHALL store the file and return a unique file identifier
4. THE Template_Manager SHALL store template metadata including filename, upload date, uploaded by user ID, and file identifier
5. WHEN template upload is successful, THE Frontend_UI SHALL display a success confirmation message
6. THE Template_Manager SHALL support template files up to 10MB in size
7. IF the file size exceeds 10MB, THEN THE Template_Manager SHALL return an error message indicating file size limit exceeded

### Requirement 2: Create New Offer Letter from Template

**User Story:** As an Admin, I want to create a new offer letter by selecting a template and a candidate, so that I can start the offer letter creation process.

#### Acceptance Criteria

1. WHEN an Admin initiates offer letter creation, THE Frontend_UI SHALL display a list of available templates
2. WHEN an Admin initiates offer letter creation, THE Frontend_UI SHALL display a searchable list of candidates from Candidate_Record
3. WHEN an Admin selects a template and candidate, THE Offer_Letter_System SHALL create a new Offer_Letter_Record with status DRAFT
4. THE Offer_Letter_Record SHALL store references to the template file identifier and candidate ID
5. WHEN the Offer_Letter_Record is created, THE Offer_Letter_System SHALL generate a unique offer letter ID
6. THE Offer_Letter_System SHALL initialize the Offer_Letter_Record with candidate information from Candidate_Record including name, email, department, and designation

### Requirement 3: Edit Offer Letter Content

**User Story:** As an Admin, I want to edit candidate-specific details in the offer letter, so that I can customize the offer for each candidate.

#### Acceptance Criteria

1. WHEN an Admin opens an offer letter in DRAFT status, THE Offer_Letter_Editor SHALL display editable fields for candidate name, position, salary, joining date, department, and reporting manager
2. WHEN an Admin modifies any field, THE Offer_Letter_Editor SHALL validate that required fields are not empty
3. WHEN an Admin modifies the salary field, THE Offer_Letter_Editor SHALL validate that the value is a positive number
4. WHEN an Admin modifies the joining date field, THE Offer_Letter_Editor SHALL validate that the date is in the future
5. WHEN an Admin saves changes, THE Backend_API SHALL update the Offer_Letter_Record in the Database
6. IF validation fails for any field, THEN THE Frontend_UI SHALL display field-specific error messages
7. THE Offer_Letter_Editor SHALL auto-save changes every 30 seconds to prevent data loss
8. WHEN auto-save occurs, THE Frontend_UI SHALL display a timestamp of the last saved version

### Requirement 4: Preview Offer Letter

**User Story:** As an Admin, I want to preview the offer letter before finalizing it, so that I can verify all information is correct.

#### Acceptance Criteria

1. WHEN an Admin requests preview, THE Offer_Letter_System SHALL merge the template content with the edited candidate-specific data
2. THE Frontend_UI SHALL display the merged offer letter in a read-only preview mode
3. THE preview SHALL render the offer letter in a format that closely matches the final PDF output
4. WHEN an Admin closes the preview, THE Frontend_UI SHALL return to the edit view without losing unsaved changes
5. THE Offer_Letter_System SHALL support preview generation for both PDF and DOCX template formats

### Requirement 5: Save Offer Letter to Database

**User Story:** As an Admin, I want to save the offer letter to the database, so that I can access it later and track its status.

#### Acceptance Criteria

1. WHEN an Admin saves an offer letter, THE Backend_API SHALL persist the Offer_Letter_Record to the Database
2. THE Offer_Letter_Record SHALL include fields for offer letter ID, candidate ID, template ID, candidate name, position, salary, joining date, department, reporting manager, status, created date, and last modified date
3. WHEN the save operation is successful, THE Backend_API SHALL return the saved Offer_Letter_Record with all generated fields
4. IF the save operation fails, THEN THE Backend_API SHALL return an error response with details
5. THE Database SHALL enforce a unique constraint on the combination of candidate ID and offer letter ID
6. THE Offer_Letter_System SHALL maintain an audit trail recording who created and last modified each offer letter

### Requirement 6: Generate and Download Offer Letter as PDF

**User Story:** As an Admin, I want to download the offer letter as a PDF, so that I can send it to the candidate via email or other channels.

#### Acceptance Criteria

1. WHEN an Admin requests PDF download, THE PDF_Generator SHALL merge the template with candidate-specific data
2. THE PDF_Generator SHALL generate a PDF document with all formatting preserved from the template
3. WHEN PDF generation is complete, THE Frontend_UI SHALL trigger a browser download with filename format "OfferLetter_{CandidateName}_{Date}.pdf"
4. THE PDF_Generator SHALL embed candidate name, position, salary, joining date, department, and reporting manager in the appropriate template placeholders
5. IF the template is in DOCX format, THE PDF_Generator SHALL convert it to PDF format
6. THE File_Storage SHALL store the generated PDF and associate it with the Offer_Letter_Record
7. WHEN PDF generation fails, THE Backend_API SHALL return an error message indicating the failure reason

### Requirement 7: Parse and Pretty Print Offer Letter Templates

**User Story:** As a developer, I want to parse offer letter templates and generate formatted output, so that I can reliably process template files and ensure data integrity.

#### Acceptance Criteria

1. WHEN a template file is uploaded, THE Template_Manager SHALL parse the file structure and extract placeholder fields
2. THE Template_Manager SHALL identify placeholders using a defined syntax (e.g., {{field_name}})
3. THE Template_Manager SHALL validate that all required placeholders exist in the template (candidate_name, position, salary, joining_date, department, reporting_manager)
4. IF required placeholders are missing, THEN THE Template_Manager SHALL return an error listing the missing placeholders
5. THE PDF_Generator SHALL format offer letter content according to the template layout and styling
6. FOR ALL valid Offer_Letter_Records, parsing the template, merging with data, generating PDF, extracting text, and parsing again SHALL produce an equivalent data structure (round-trip property)

### Requirement 8: Track Offer Letter Status

**User Story:** As an Admin, I want to track the status of each offer letter, so that I can monitor the recruitment pipeline and follow up appropriately.

#### Acceptance Criteria

1. WHEN an offer letter is created, THE Status_Tracker SHALL set the initial status to DRAFT
2. WHEN an Admin marks an offer letter as sent, THE Status_Tracker SHALL update the status to ISSUED
3. WHEN an Admin marks an offer letter as accepted, THE Status_Tracker SHALL update the status to ACCEPTED
4. WHEN an Admin marks an offer letter as rejected, THE Status_Tracker SHALL update the status to REJECTED
5. THE Status_Tracker SHALL record the timestamp of each status change
6. THE Status_Tracker SHALL record the user ID of the person who changed the status
7. WHILE an offer letter has status ISSUED, THE Frontend_UI SHALL display the number of days since issuance
8. THE Backend_API SHALL validate that status transitions follow allowed paths: DRAFT → ISSUED → (ACCEPTED or REJECTED)
9. IF an invalid status transition is attempted, THEN THE Backend_API SHALL return an error message

### Requirement 9: View Offer Letter List

**User Story:** As an Admin, I want to view a list of all offer letters with their current status, so that I can manage multiple offers efficiently.

#### Acceptance Criteria

1. WHEN an Admin navigates to the offer letter management page, THE Frontend_UI SHALL display a table of all Offer_Letter_Records
2. THE table SHALL include columns for candidate name, position, department, status, created date, and actions
3. THE Frontend_UI SHALL support filtering the list by status (DRAFT, ISSUED, ACCEPTED, REJECTED)
4. THE Frontend_UI SHALL support searching the list by candidate name or position
5. THE Frontend_UI SHALL support sorting the list by created date, candidate name, or status
6. WHEN an Admin clicks on an offer letter row, THE Frontend_UI SHALL navigate to the offer letter detail view
7. THE Frontend_UI SHALL display the total count of offer letters for each status category

### Requirement 10: Role-Based Access Control

**User Story:** As a system administrator, I want to enforce role-based access control for offer letter operations, so that only authorized users can perform sensitive actions.

#### Acceptance Criteria

1. WHEN a user with role Admin accesses the offer letter feature, THE Backend_API SHALL allow create, edit, preview, download, and status update operations
2. WHEN a user with role HR_Manager accesses the offer letter feature, THE Backend_API SHALL allow view and download operations only
3. WHEN a user with role HR_Manager attempts to create or edit an offer letter, THE Backend_API SHALL return an authorization error
4. WHEN a user without Admin or HR_Manager role attempts to access the offer letter feature, THE Backend_API SHALL return an authorization error
5. THE Frontend_UI SHALL hide create and edit buttons for users with HR_Manager role
6. THE Frontend_UI SHALL hide the offer letter menu item for users without Admin or HR_Manager role
7. THE Backend_API SHALL validate user role and permissions on every API request

### Requirement 11: Link Offer Letter to Candidate Record

**User Story:** As an Admin, I want offer letters to be linked to candidate records, so that I can view a candidate's offer letter history from their profile.

#### Acceptance Criteria

1. WHEN an offer letter is created, THE Offer_Letter_System SHALL store the candidate ID from Candidate_Record
2. THE Offer_Letter_System SHALL support linking to both Employee and User records as candidates
3. WHEN viewing a candidate profile, THE Frontend_UI SHALL display a list of associated offer letters
4. THE Frontend_UI SHALL display offer letter status, created date, and a link to view the offer letter
5. WHEN a candidate record is deleted, THE Offer_Letter_System SHALL retain the offer letter records but mark the candidate link as inactive
6. THE Backend_API SHALL provide an endpoint to retrieve all offer letters for a specific candidate ID

### Requirement 12: Validate Offer Letter Data Integrity

**User Story:** As a system administrator, I want the system to validate offer letter data integrity, so that I can ensure data consistency and prevent corruption.

#### Acceptance Criteria

1. WHEN an offer letter is saved, THE Backend_API SHALL validate that all required fields contain non-empty values
2. THE Backend_API SHALL validate that salary is a positive decimal number with at most two decimal places
3. THE Backend_API SHALL validate that joining date is a valid date in ISO 8601 format
4. THE Backend_API SHALL validate that candidate ID references an existing Candidate_Record
5. THE Backend_API SHALL validate that template ID references an existing template file
6. THE Backend_API SHALL validate that reporting manager name is not empty and contains only alphabetic characters and spaces
7. IF any validation fails, THEN THE Backend_API SHALL return a detailed error response listing all validation failures
8. THE Backend_API SHALL sanitize all text inputs to prevent injection attacks

### Requirement 13: Handle Concurrent Edits

**User Story:** As an Admin, I want the system to handle concurrent edits gracefully, so that I don't lose work when multiple users edit the same offer letter.

#### Acceptance Criteria

1. WHEN an Admin opens an offer letter for editing, THE Backend_API SHALL record the current version timestamp
2. WHEN an Admin saves changes, THE Backend_API SHALL check if the offer letter has been modified by another user since it was opened
3. IF the offer letter has been modified by another user, THEN THE Backend_API SHALL return a conflict error
4. WHEN a conflict occurs, THE Frontend_UI SHALL display a message indicating that the offer letter has been modified by another user
5. THE Frontend_UI SHALL provide options to reload the latest version or overwrite with current changes
6. THE Backend_API SHALL use optimistic locking to prevent lost updates

### Requirement 14: Integrate with Recruitment Page

**User Story:** As an Admin, I want to access offer letter management from the Recruitment page, so that I can manage offers as part of the recruitment workflow.

#### Acceptance Criteria

1. WHEN an Admin views the Recruitment page, THE Frontend_UI SHALL display an "Offer Letters" tab or section
2. WHEN an Admin clicks on a candidate in the recruitment pipeline, THE Frontend_UI SHALL display an option to create an offer letter for that candidate
3. WHEN an offer letter is created from the recruitment page, THE Offer_Letter_System SHALL pre-populate candidate information from the recruitment record
4. THE Frontend_UI SHALL display offer letter status alongside candidate information in the recruitment pipeline view
5. WHEN an offer letter status changes to ACCEPTED, THE Recruitment page SHALL reflect the updated candidate status

### Requirement 15: Support Email Integration for Sending Offer Letters

**User Story:** As an Admin, I want to send offer letters via email directly from the system, so that I can streamline the candidate communication process.

#### Acceptance Criteria

1. WHEN an Admin clicks "Send Email" on an offer letter, THE Frontend_UI SHALL open an email composition dialog
2. THE email composition dialog SHALL pre-populate the recipient email address from the candidate record
3. THE email composition dialog SHALL pre-populate a default subject line "Offer Letter - [Position] at [Company]"
4. THE email composition dialog SHALL pre-populate a default email body with professional greeting and offer letter attachment notice
5. WHEN an Admin sends the email, THE Backend_API SHALL attach the generated PDF to the email
6. WHEN the email is sent successfully, THE Status_Tracker SHALL automatically update the offer letter status to ISSUED
7. THE Backend_API SHALL record the email sent timestamp and recipient email address in the Offer_Letter_Record
8. IF email sending fails, THEN THE Backend_API SHALL return an error message and the status SHALL remain unchanged

### Requirement 16: Archive and Retrieve Historical Offer Letters

**User Story:** As an Admin, I want to archive old offer letters and retrieve them when needed, so that I can maintain a clean active list while preserving historical records.

#### Acceptance Criteria

1. WHEN an offer letter has status ACCEPTED or REJECTED for more than 90 days, THE Frontend_UI SHALL display an "Archive" option
2. WHEN an Admin archives an offer letter, THE Offer_Letter_System SHALL mark the record as archived without deleting it
3. WHILE viewing the offer letter list, THE Frontend_UI SHALL hide archived offer letters by default
4. THE Frontend_UI SHALL provide a toggle to show or hide archived offer letters
5. WHEN viewing archived offer letters, THE Frontend_UI SHALL display an "Unarchive" option
6. THE Backend_API SHALL provide endpoints to archive, unarchive, and retrieve archived offer letters
7. THE Offer_Letter_System SHALL retain all archived offer letters indefinitely for compliance and audit purposes
