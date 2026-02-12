from algopy import *
from algopy.arc4 import abimethod, String as ARC4String, UInt64 as ARC4UInt64, Struct, Bool as ARC4Bool


class CertificateData(Struct):
    """On-chain certificate metadata stored in box storage"""
    recipient: ARC4String
    skill: ARC4String
    skill_level: ARC4String
    ai_score: ARC4UInt64
    evidence_hash: ARC4String
    issuer: ARC4String
    issue_date: ARC4String
    metadata_url: ARC4String
    is_revoked: ARC4Bool


class CertifyMe(ARC4Contract):
    """
    CertifyMe — AI-Verified Blockchain Certificate Contract

    Issues ARC-19 compliant NFT certificates after AI skill verification.
    Each certificate stores: recipient, skill, AI score, evidence IPFS hash,
    issuer info, and revocation status.
    """

    # Global state
    certificate_count: UInt64
    admin: Account
    min_ai_score: UInt64

    def __init__(self) -> None:
        """Initialize contract with deployer as admin"""
        self.certificate_count = UInt64(0)
        self.admin = Txn.sender
        self.min_ai_score = UInt64(45)
        # Box maps for certificate data and skill registry
        self.certificates = BoxMap(UInt64, CertificateData, key_prefix="cert_")
        self.skills = BoxMap(ARC4String, ARC4UInt64, key_prefix="skill_")

    # ────────────────────────── Certificate Methods ──────────────────────── #

    @abimethod()
    def mint_certificate(
        self,
        recipient: ARC4String,
        skill: ARC4String,
        skill_level: ARC4String,
        ai_score: ARC4UInt64,
        evidence_hash: ARC4String,
        issuer: ARC4String,
        issue_date: ARC4String,
        metadata_url: ARC4String,
    ) -> UInt64:
        """
        Mint a new certificate after AI verification passes.
        Only callable by admin (the contract deployer).
        Returns the certificate ID.
        """
        assert Txn.sender == self.admin, "Only admin can mint certificates"
        assert ai_score.native >= self.min_ai_score, "AI score below minimum threshold"

        cert_id = self.certificate_count

        self.certificates[cert_id] = CertificateData(
            recipient=recipient,
            skill=skill,
            skill_level=skill_level,
            ai_score=ai_score,
            evidence_hash=evidence_hash,
            issuer=issuer,
            issue_date=issue_date,
            metadata_url=metadata_url,
            is_revoked=ARC4Bool(False),
        )

        self.certificate_count += UInt64(1)
        return cert_id

    @abimethod(readonly=True)
    def get_certificate(self, cert_id: UInt64) -> CertificateData:
        """Retrieve certificate details by ID"""
        data, exists = self.certificates.maybe(cert_id)
        assert exists, "Certificate not found"
        return data.copy()

    @abimethod(readonly=True)
    def verify_certificate(self, cert_id: UInt64) -> ARC4Bool:
        """Check if a certificate exists and is not revoked"""
        data, exists = self.certificates.maybe(cert_id)
        if not exists:
            return ARC4Bool(False)
        return ARC4Bool(not data.is_revoked.native)

    @abimethod()
    def revoke_certificate(self, cert_id: UInt64) -> None:
        """Revoke a certificate if fraud is discovered. Admin only."""
        assert Txn.sender == self.admin, "Only admin can revoke certificates"
        data, exists = self.certificates.maybe(cert_id)
        assert exists, "Certificate not found"

        self.certificates[cert_id] = CertificateData(
            recipient=data.recipient,
            skill=data.skill,
            skill_level=data.skill_level,
            ai_score=data.ai_score,
            evidence_hash=data.evidence_hash,
            issuer=data.issuer,
            issue_date=data.issue_date,
            metadata_url=data.metadata_url,
            is_revoked=ARC4Bool(True),
        )

    @abimethod(readonly=True)
    def get_certificate_count(self) -> UInt64:
        """Returns the total number of certificates issued"""
        return self.certificate_count

    # ────────────────────────── Skill Registry Methods ──────────────────── #

    @abimethod()
    def register_skill(self, skill_name: ARC4String, min_score: ARC4UInt64) -> None:
        """Register a new verifiable skill with its minimum AI score threshold"""
        assert Txn.sender == self.admin, "Only admin can register skills"
        self.skills[skill_name] = min_score

    @abimethod(readonly=True)
    def get_skill_threshold(self, skill_name: ARC4String) -> ARC4UInt64:
        """Get the minimum AI score required for a skill"""
        threshold, exists = self.skills.maybe(skill_name)
        assert exists, "Skill not registered"
        return threshold.copy()

    # ────────────────────────── Admin Methods ────────────────────────────── #

    @abimethod()
    def update_min_score(self, new_min: UInt64) -> None:
        """Update the global minimum AI score for certification"""
        assert Txn.sender == self.admin, "Only admin can update settings"
        self.min_ai_score = new_min

    @abimethod()
    def transfer_admin(self, new_admin: Account) -> None:
        """Transfer admin role to another account"""
        assert Txn.sender == self.admin, "Only admin can transfer admin role"
        self.admin = new_admin
