#!/usr/bin/env python
"""Tests for API client and approvals-related API calls."""
from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

import threading
import time

from absl import app

from grr_response_core.lib.util import compatibility
from grr_response_server.gui import api_auth_manager
from grr_response_server.gui import api_call_router_with_approval_checks
from grr_response_server.gui import api_e2e_test_lib
from grr.test_lib import hunt_test_lib
from grr.test_lib import test_lib


class ApiClientLibApprovalsTest(api_e2e_test_lib.ApiE2ETest,
                                hunt_test_lib.StandardHuntTestMixin):

  def setUp(self):
    super(ApiClientLibApprovalsTest, self).setUp()

    cls = api_call_router_with_approval_checks.ApiCallRouterWithApprovalChecks
    cls.ClearCache()

    config_overrider = test_lib.ConfigOverrider(
        {"API.DefaultRouter": compatibility.GetName(cls)})
    config_overrider.Start()
    self.addCleanup(config_overrider.Stop)

    # Force creation of new APIAuthorizationManager, so that configuration
    # changes are picked up.
    api_auth_manager.InitializeApiAuthManager()

  def testCreateClientApproval(self):
    client_id = self.SetupClient(0)

    approval = self.api.Client(client_id).CreateApproval(
        reason="blah", notified_users=[u"foo"])
    self.assertEqual(approval.client_id, client_id)
    self.assertEqual(approval.data.subject.client_id, client_id)
    self.assertEqual(approval.data.reason, "blah")
    self.assertFalse(approval.data.is_valid)

  def testWaitUntilClientApprovalValid(self):
    client_id = self.SetupClient(0)

    approval = self.api.Client(client_id).CreateApproval(
        reason="blah", notified_users=[u"foo"])
    self.assertFalse(approval.data.is_valid)

    def ProcessApproval():
      time.sleep(1)
      self.GrantClientApproval(
          client_id,
          requestor=self.token.username,
          approval_id=approval.approval_id,
          approver=u"foo")

    thread = threading.Thread(name="ProcessApprover", target=ProcessApproval)
    thread.start()
    try:
      result_approval = approval.WaitUntilValid()
      self.assertTrue(result_approval.data.is_valid)
    finally:
      thread.join()

  def testCreateHuntApproval(self):
    h_id = self.StartHunt()

    approval = self.api.Hunt(h_id).CreateApproval(
        reason="blah", notified_users=[u"foo"])
    self.assertEqual(approval.hunt_id, h_id)
    self.assertEqual(approval.data.subject.hunt_id, h_id)
    self.assertEqual(approval.data.reason, "blah")
    self.assertFalse(approval.data.is_valid)

  def testWaitUntilHuntApprovalValid(self):
    h_id = self.StartHunt()

    approval = self.api.Hunt(h_id).CreateApproval(
        reason="blah", notified_users=[u"approver"])
    self.assertFalse(approval.data.is_valid)

    def ProcessApproval():
      time.sleep(1)
      self.GrantHuntApproval(
          h_id,
          requestor=self.token.username,
          approval_id=approval.approval_id,
          approver=u"approver")

    ProcessApproval()
    thread = threading.Thread(name="HuntApprover", target=ProcessApproval)
    thread.start()
    try:
      result_approval = approval.WaitUntilValid()
      self.assertTrue(result_approval.data.is_valid)
    finally:
      thread.join()


def main(argv):
  test_lib.main(argv)


if __name__ == "__main__":
  app.run(main)
