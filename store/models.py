# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.
from __future__ import unicode_literals

from django.db import models

class Categories(models.Model):
    category = models.IntegerField(primary_key=True)
    categoryname = models.CharField(max_length=50)
    
    def __unicode__(self):
        return self.categoryname
    
    class Meta:
        db_table = 'categories'

class CustHist(models.Model):
    customerid = models.ForeignKey('Customers', db_column='customerid')
    orderid = models.IntegerField()
    prod_id = models.IntegerField()
    
    def __unicode__(self):
        return "CustId[%s]OrderId[%s]ProdId[%s]" % (self.customerid, self.orderid, self.prod_id)
    
    class Meta:
        db_table = 'cust_hist'

class Customers(models.Model):
    customerid = models.IntegerField(primary_key=True)
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    address1 = models.CharField(max_length=50)
    address2 = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50, blank=True)
    zip = models.CharField(max_length=9, blank=True)
    country = models.CharField(max_length=50)
    region = models.SmallIntegerField()
    email = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    creditcardtype = models.IntegerField()
    creditcard = models.CharField(max_length=50)
    creditcardexpiration = models.CharField(max_length=50)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=50)
    age = models.SmallIntegerField(null=True, blank=True)
    income = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, blank=True)
    
    def __unicode__(self):
        return "([%s]%s %s)" % (self.customerid, self.firstname, self.lastname)
      
    class Meta:
        db_table = 'customers'

class Inventory(models.Model):
    prod_id = models.IntegerField(primary_key=True)
    quan_in_stock = models.IntegerField()
    sales = models.IntegerField()
    class Meta:
        db_table = 'inventory'

class Orderlines(models.Model):
    orderlineid = models.SmallIntegerField()
    orderid = models.ForeignKey('Orders', db_column='orderid')
    prod_id = models.IntegerField()
    quantity = models.SmallIntegerField()
    orderdate = models.DateField()
    class Meta:
        db_table = 'orderlines'

class Orders(models.Model):
    orderid = models.IntegerField(primary_key=True)
    orderdate = models.DateField()
    customerid = models.ForeignKey(Customers, null=True, db_column='customerid', blank=True)
    netamount = models.DecimalField(max_digits=65535, decimal_places=65535)
    tax = models.DecimalField(max_digits=65535, decimal_places=65535)
    totalamount = models.DecimalField(max_digits=65535, decimal_places=65535)
    class Meta:
        db_table = 'orders'

class Products(models.Model):
    prod_id = models.IntegerField(primary_key=True)
    category = models.SmallIntegerField()
    title = models.TextField()
    actor = models.TextField()
    price = models.DecimalField(max_digits=65535, decimal_places=65535)
    special = models.SmallIntegerField(null=True, blank=True)
    common_prod_id = models.IntegerField()
    class Meta:
        db_table = 'products'

class Reorder(models.Model):
    prod_id = models.IntegerField()
    date_low = models.DateField()
    quan_low = models.IntegerField()
    date_reordered = models.DateField(null=True, blank=True)
    quan_reordered = models.IntegerField(null=True, blank=True)
    date_expected = models.DateField(null=True, blank=True)
    class Meta:
        db_table = 'reorder'

