# -*- coding: utf-8 -*-

from odoo import http
from odoo.addons.portal.controllers import portal as portal_controller


class CustomerPortal(portal_controller.CustomerPortal):
    """Override portal controller to make specific address fields mandatory"""

    def _get_mandatory_billing_address_fields(self, country_sudo):
        """Return mandatory fields: name, street, city, phone"""
        return {'name', 'street', 'city', 'phone'}

    def _get_mandatory_delivery_address_fields(self, country_sudo):
        """Return mandatory fields: name, street, city, phone"""
        return {'name', 'street', 'city', 'phone'}

    def _get_mandatory_address_fields(self, country_sudo):
        """Return mandatory fields: name, street, city, phone"""
        return {'name', 'street', 'city', 'phone'}

    def _get_default_country(self, **kwargs):
        """Return Pakistan as default country"""
        pakistan = http.request.env['res.country'].sudo().search([('code', '=', 'PK')], limit=1)
        return pakistan or super()._get_default_country(**kwargs)

