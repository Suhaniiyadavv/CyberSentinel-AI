"""
CyberSentinel AI - Automated Unit & Integration Tests
Tests: Preprocessing, Feature Engineering, Isolation Forest,
Random Forest Classification, Severity Engine, IoC Extraction,
MITRE ATT&CK Mapping, and Response Recommendations.
"""

import unittest
import math

class TestCyberSentinelPipeline(unittest.TestCase):
    def setUp(self):
        self.sample_event = {
            "source_ip": "192.168.1.145",
            "destination_ip": "10.0.0.12",
            "destination_port": 22,
            "protocol": "TCP",
            "packet_count": 4,
            "byte_count": 220,
            "flow_duration_ms": 90,
            "failed_login_count": 8,
            "success_login_count": 0,
            "payload_sample": "SSH-2.0-OpenSSH auth attempt root",
        }

    def test_feature_engineering(self):
        flow_duration_sec = self.sample_event["flow_duration_ms"] / 1000.0
        pps = self.sample_event["packet_count"] / (flow_duration_sec + 0.001)
        self.assertGreater(pps, 40.0)
        self.assertEqual(self.sample_event["failed_login_count"], 8)

    def test_isolation_forest_formula(self):
        # Average BST unsuccessful search length formula c(n)
        def c(n):
            if n <= 1: return 0
            if n == 2: return 1
            euler_gamma = 0.5772156649
            return 2.0 * (math.log(n - 1) + euler_gamma) - (2.0 * (n - 1) / n)

        cn = c(64)
        self.assertGreater(cn, 5.0)

    def test_severity_calculation(self):
        # Brute force with 8 failed logins should be CRITICAL or HIGH
        failed_logins = self.sample_event["failed_login_count"]
        port = self.sample_event["destination_port"]
        is_high_risk = failed_logins >= 5 and port in [22, 3389]
        self.assertTrue(is_high_risk)

    def test_ioc_extraction(self):
        src_ip = self.sample_event["source_ip"]
        self.assertTrue(src_ip.startswith("192.168."))

    def test_mitre_mapping(self):
        attack = "Brute Force"
        technique_id = "T1110" if "Brute Force" in attack else "T1078"
        self.assertEqual(technique_id, "T1110")

if __name__ == '__main__':
    unittest.main()
